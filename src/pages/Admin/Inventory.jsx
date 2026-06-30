import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, onSnapshot, getDocs, doc, updateDoc, addDoc, where, serverTimestamp } from 'firebase/firestore';
import { Html5Qrcode } from 'html5-qrcode';
import { Package, Scan, Plus, Minus, Check, AlertTriangle, RefreshCw, X, LogIn, LogOut } from 'lucide-react';
import BouncingPawLoader from '../../components/BouncingPawLoader';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState('IN'); // 'IN' = Stock In, 'OUT' = Stock Out
  const [scanQty, setScanQty] = useState(1); // default quantity per scan
  const [scannerStatus, setScannerStatus] = useState('');
  
  // New Item Form Modal States
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newBarcode, setNewBarcode] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(0);
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemThreshold, setNewItemThreshold] = useState(5);

  const scannerRef = useRef(null);
  const html5QrCodeInstance = useRef(null);

  // Fetch Inventory and Logs
  useEffect(() => {
    const qInv = query(collection(db, 'inventory'));
    const unsubInv = onSnapshot(qInv, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setInventory(items);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching inventory:', error);
      setLoading(false);
    });

    const qLogs = query(collection(db, 'inventory_logs'));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      // Sort logs locally (descending by timestamp)
      items.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
        return timeB - timeA;
      });
      setLogs(items.slice(0, 10)); // keep last 10 logs
    });

    return () => {
      unsubInv();
      unsubLogs();
      stopScanner();
    };
  }, []);

  // Initialize and Stop Scanner
  const startScanner = async () => {
    setIsScanning(true);
    setScannerStatus('Starting camera stream...');
    
    // Slight delay to ensure the container is rendered
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeInstance.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          async (decodedText) => {
            setScannerStatus(`Barcode detected: ${decodedText}`);
            await handleBarcodeScanned(decodedText);
          },
          (errorMessage) => {
            // Quietly ignore frame errors (normal for camera polling)
          }
        );
        setScannerStatus('Camera active. Place barcode/QR in the viewport.');
      } catch (err) {
        console.error('Failed starting barcode scanner:', err);
        setScannerStatus(`Camera Error: ${err.message || err}`);
      }
    }, 300);
  };

  const stopScanner = async () => {
    if (html5QrCodeInstance.current && html5QrCodeInstance.current.isScanning) {
      try {
        await html5QrCodeInstance.current.stop();
      } catch (err) {
        console.error('Failed stopping barcode scanner:', err);
      }
    }
    html5QrCodeInstance.current = null;
    setIsScanning(false);
    setScannerStatus('');
  };

  // Barcode Handler
  const handleBarcodeScanned = async (barcode) => {
    try {
      // 1. Query Firestore for barcode
      const invRef = collection(db, 'inventory');
      const q = query(invRef, where('barcode', '==', barcode.trim()));
      const snap = await getDocs(q);

      if (snap.empty) {
        // Item does not exist - prompt to create
        setScannerStatus(`New barcode detected: ${barcode}. Opening creation form...`);
        setNewBarcode(barcode.trim());
        
        // Stop camera first
        await stopScanner();
        
        // Open modal
        setShowNewItemModal(true);
      } else {
        // Item exists - update qty
        const itemDoc = snap.docs[0];
        const itemData = itemDoc.data();
        const currentQty = parseInt(itemData.quantity) || 0;
        
        let newQty = currentQty;
        const changeAmount = parseInt(scanQty) || 1;

        if (scanMode === 'IN') {
          newQty = currentQty + changeAmount;
        } else {
          newQty = Math.max(0, currentQty - changeAmount);
        }

        // Update Firestore
        await updateDoc(doc(db, 'inventory', itemDoc.id), {
          quantity: newQty,
          updatedAt: serverTimestamp()
        });

        // Log transaction
        await addDoc(collection(db, 'inventory_logs'), {
          itemId: itemDoc.id,
          itemName: itemData.name,
          barcode: itemData.barcode,
          direction: scanMode,
          quantityChanged: changeAmount,
          newQuantity: newQty,
          adminEmail: auth.currentUser?.email || 'Admin',
          timestamp: serverTimestamp()
        });

        setScannerStatus(`Success! Updated ${itemData.name} (Qty: ${currentQty} → ${newQty})`);
        
        // Beep/sound feedback (optional, we can just display text)
        setTimeout(() => {
          if (html5QrCodeInstance.current) {
            setScannerStatus('Camera active. Place barcode/QR in the viewport.');
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Scan handling error:', err);
      setScannerStatus(`Error: ${err.message}`);
    }
  };

  // Create New Product
  const handleCreateNewItem = async (e) => {
    e.preventDefault();
    if (!newItemName || !newBarcode || newItemQty === '' || newItemThreshold === '') return;

    try {
      const qtyNum = parseInt(newItemQty);
      const docRef = await addDoc(collection(db, 'inventory'), {
        name: newItemName,
        barcode: newBarcode,
        quantity: qtyNum,
        category: newItemCategory || 'Uncategorized',
        lowStockThreshold: parseInt(newItemThreshold),
        updatedAt: serverTimestamp()
      });

      // Log first entry
      await addDoc(collection(db, 'inventory_logs'), {
        itemId: docRef.id,
        itemName: newItemName,
        barcode: newBarcode,
        direction: 'IN',
        quantityChanged: qtyNum,
        newQuantity: qtyNum,
        adminEmail: auth.currentUser?.email || 'Admin',
        timestamp: serverTimestamp()
      });

      // Reset states
      setNewItemName('');
      setNewBarcode('');
      setNewItemQty(0);
      setNewItemCategory('');
      setNewItemThreshold(5);
      setShowNewItemModal(false);
      
      // Re-enable scanner if clicked back
      alert('Inventory item created successfully!');
    } catch (error) {
      console.error('Error creating inventory item:', error);
      alert('Failed to create inventory item.');
    }
  };

  // Find low stock items
  const lowStockItems = inventory.filter(item => item.quantity <= item.lowStockThreshold);

  return (
    <div className="space-y-6">
      
      {/* 1. Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs font-semibold text-amber-800 space-y-2 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>Low Stock Warning Alert ({lowStockItems.length} items)</span>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {lowStockItems.map(item => (
              <li key={item.id}>
                <span className="font-bold">{item.name}</span> is running low (Current Qty: <span className="font-bold underline">{item.quantity}</span> / Threshold: {item.lowStockThreshold})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. Top Scanner Module Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scan className="h-5 w-5 text-slate-700" />
              <span>Camera Barcode / QR Scanner</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Scan barcodes using your phone or webcam to adjust stock</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls (5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Scan Mode Toggle */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scanner Operations Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setScanMode('IN')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    scanMode === 'IN'
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Stock In (+)</span>
                </button>
                
                <button
                  onClick={() => setScanMode('OUT')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    scanMode === 'OUT'
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Stock Out (-)</span>
                </button>
              </div>
            </div>

            {/* Scan Count Quantity */}
            <div className="space-y-1.5">
              <label htmlFor="scanQty" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adjustment Quantity per Scan</label>
              <input
                id="scanQty"
                type="number"
                min="1"
                value={scanQty}
                onChange={(e) => setScanQty(parseInt(e.target.value) || 1)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
              />
            </div>

            {/* Start / Stop scanner triggers */}
            <div className="pt-2">
              {isScanning ? (
                <button
                  onClick={stopScanner}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer border border-red-500"
                >
                  <X className="h-4.5 w-4.5" />
                  <span>Turn Off Scanner Camera</span>
                </button>
              ) : (
                <button
                  onClick={startScanner}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
                >
                  <Scan className="h-4.5 w-4.5" />
                  <span>Turn On Scanner Camera</span>
                </button>
              )}
            </div>

            {/* Scanner status output log */}
            {scannerStatus && (
              <div className="p-3 bg-slate-55 border border-slate-200 rounded-lg text-xs text-slate-600 break-words font-medium animate-pulse">
                {scannerStatus}
              </div>
            )}

          </div>

          {/* Scanner Viewport (7 columns) */}
          <div className="lg:col-span-7 flex justify-center bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[300px]">
            {isScanning ? (
              <div className="w-full max-w-sm flex flex-col items-center justify-center">
                <div id="reader" className="w-full border-2 border-dashed border-slate-350 bg-black rounded-lg overflow-hidden relative"></div>
                <p className="text-[10px] text-slate-400 font-semibold mt-2 animate-pulse text-center">Allow camera permission if prompted</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Scan className="h-12 w-12 text-slate-300 stroke-1" />
                <p className="text-xs font-semibold">Scanner camera is currently idle</p>
                <p className="text-[10px] text-slate-500 text-center max-w-xs">Click "Turn On Scanner Camera" to start. Scanner supports standard QR codes, EAN-13, EAN-8, UPC barcodes.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Grid for Inventory List Table & logs */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Inventory Items list (8 columns) */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Package className="h-4.5 w-4.5 text-slate-700" />
                <span>Inventory Items Stock</span>
              </h3>
            </div>
            
            <button
              onClick={() => {
                setNewBarcode('');
                setShowNewItemModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Manual Item</span>
            </button>
          </div>

          {loading ? (
            <div className="py-8 flex flex-col justify-center items-center text-slate-500 gap-1.5">
              <BouncingPawLoader size="sm" />
              <span className="text-xs font-semibold">Loading items...</span>
            </div>
          ) : inventory.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">No items registered in inventory database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="px-4 py-2.5">Item Name</th>
                    <th className="px-4 py-2.5">Barcode / SKU</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5 text-center">Stock Level</th>
                    <th className="px-4 py-2.5 text-center">Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {inventory.map((item) => {
                    const isLow = item.quantity <= item.lowStockThreshold;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{item.barcode}</td>
                        <td className="px-4 py-3 text-slate-500">{item.category}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            isLow 
                              ? 'bg-rose-50 border border-rose-200 text-rose-800 font-extrabold' 
                              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          }`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-400">{item.lowStockThreshold}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Logs list (4 columns) */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <RefreshCw className="h-4.5 w-4.5 text-slate-700" />
              <span>Recent Scan Logs</span>
            </h3>
          </div>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No scan activity logged today.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 truncate max-w-[150px]">{log.itemName}</span>
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      log.direction === 'IN' 
                        ? 'bg-emerald-55 border border-emerald-250 text-emerald-800' 
                        : 'bg-rose-55 border border-rose-250 text-rose-800'
                    }`}>
                      {log.direction === 'IN' ? <Plus className="h-2 w-2" /> : <Minus className="h-2 w-2" />}
                      <span>{log.quantityChanged}</span>
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-slate-400 font-mono">Barcode: {log.barcode}</div>
                  
                  <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1 border-t border-slate-200/50 mt-1">
                    <span>by {log.adminEmail.split('@')[0]}</span>
                    <span>{log.timestamp ? new Date(log.timestamp.toDate()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 4. Create New Item Form Modal Dialog */}
      {showNewItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-250">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Register New Inventory Item</h3>
              <button
                onClick={() => setShowNewItemModal(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleCreateNewItem} className="p-6 space-y-4 text-xs font-semibold">
              
              {/* Prefilled Barcode */}
              <div className="space-y-1">
                <label className="text-slate-500 uppercase tracking-wide text-[10px]">Barcode / SKU</label>
                <input
                  type="text"
                  value={newBarcode}
                  onChange={(e) => setNewBarcode(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 font-mono focus:outline-none"
                  required
                />
              </div>

              {/* Item Name */}
              <div className="space-y-1">
                <label htmlFor="itemName" className="text-slate-700 uppercase tracking-wide text-[10px]">Product / Item Name *</label>
                <input
                  id="itemName"
                  type="text"
                  placeholder="e.g. Oatmeal Pet Shampoo (250ml)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                  required
                />
              </div>

              {/* Item Category */}
              <div className="space-y-1">
                <label htmlFor="itemCategory" className="text-slate-700 uppercase tracking-wide text-[10px]">Category</label>
                <input
                  id="itemCategory"
                  type="text"
                  placeholder="e.g. Hygiene / Spa Supplies / Accessories"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                />
              </div>

              {/* Grid Qty & Threshold */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="itemQty" className="text-slate-700 uppercase tracking-wide text-[10px]">Initial Quantity *</label>
                  <input
                    id="itemQty"
                    type="number"
                    min="0"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(parseInt(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="itemThreshold" className="text-slate-700 uppercase tracking-wide text-[10px]">Low Stock Threshold *</label>
                  <input
                    id="itemThreshold"
                    type="number"
                    min="1"
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(parseInt(e.target.value) || 1)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Form trigger buttons */}
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewItemModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 bg-slate-50 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Register Item</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
