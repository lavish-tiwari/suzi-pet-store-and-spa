import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, writeBatch, addDoc, serverTimestamp } from 'firebase/firestore';
import { Image, Video, Trash2, ArrowUp, ArrowDown, Upload, Save, Play, X, AlertCircle } from 'lucide-react';

export default function AdminGallery() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form edit tracking (key is doc.id)
  const [captions, setCaptions] = useState({});

  // Before-After Pair State
  const [uploadType, setUploadType] = useState('single'); // 'single' or 'pair'
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [beforePreview, setBeforePreview] = useState('');
  const [afterPreview, setAfterPreview] = useState('');
  const [pairCaption, setPairCaption] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsList = [];
      const caps = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        itemsList.push({ id: doc.id, ...data });
        caps[doc.id] = data.caption || '';
      });
      setMediaItems(itemsList);
      setCaptions(caps);
      setLoading(false);
    }, (error) => {
      console.error("Error loading gallery in admin:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUploadFile = async (file) => {
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      setErrorMsg('Invalid file type. Please upload an image or video file.');
      return;
    }

    setErrorMsg('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      let downloadUrl = '';

      const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

      if (useEmulator) {
        const fileExtension = file.name.split('.').pop();
        const fileName = `gallery_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
        const storageRef = ref(storage, `gallery/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          }, 
          (error) => {
            console.error("Upload progress tracking error:", error);
          }
        );

        const snapshot = await uploadTask;
        downloadUrl = await getDownloadURL(snapshot.ref);
      } else {
        // Upload to Cloudinary for free production storage (supports images & videos)
        setUploadProgress(30);
        downloadUrl = await uploadToCloudinary(file);
        setUploadProgress(100);
      }
      
      await addDoc(collection(db, 'gallery'), {
        mediaUrl: downloadUrl,
        type: isImage ? 'image' : 'video',
        category: isImage ? 'photos' : 'videos', 
        caption: '',
        uploadedAt: serverTimestamp(),
        order: mediaItems.length 
      });

      setIsUploading(false);
      setUploadProgress(0);
    } catch (err) {
      console.error("Upload or record creation failed:", err);
      setErrorMsg(`Upload failed: ${err.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration is missing. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.");
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || 'Failed to upload to Cloudinary.');
    }

    const resJson = await res.json();
    return resJson.secure_url;
  };

  const handleUploadPair = async () => {
    if (!beforeFile || !afterFile) {
      setErrorMsg('Please select both a Before and an After photo.');
      return;
    }

    setErrorMsg('');
    setIsUploading(true);
    setUploadProgress(0);

    const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

    try {
      let beforeUrl = '';
      let afterUrl = '';

      if (useEmulator) {
        // Upload to Firebase Storage Emulator
        const beforeExt = beforeFile.name.split('.').pop();
        const beforeName = `gallery_before_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${beforeExt}`;
        const beforeStorageRef = ref(storage, `gallery/${beforeName}`);
        const beforeUploadTask = uploadBytesResumable(beforeStorageRef, beforeFile);

        const afterExt = afterFile.name.split('.').pop();
        const afterName = `gallery_after_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${afterExt}`;
        const afterStorageRef = ref(storage, `gallery/${afterName}`);
        const afterUploadTask = uploadBytesResumable(afterStorageRef, afterFile);

        let beforeProg = 0;
        let afterProg = 0;

        beforeUploadTask.on('state_changed', (snap) => {
          beforeProg = (snap.bytesTransferred / snap.totalBytes) * 100;
          setUploadProgress(Math.round((beforeProg + afterProg) / 2));
        });

        afterUploadTask.on('state_changed', (snap) => {
          afterProg = (snap.bytesTransferred / snap.totalBytes) * 100;
          setUploadProgress(Math.round((beforeProg + afterProg) / 2));
        });

        const [beforeSnapshot, afterSnapshot] = await Promise.all([beforeUploadTask, afterUploadTask]);

        beforeUrl = await getDownloadURL(beforeSnapshot.ref);
        afterUrl = await getDownloadURL(afterSnapshot.ref);
      } else {
        // Upload to Cloudinary for free production storage
        setUploadProgress(20);
        beforeUrl = await uploadToCloudinary(beforeFile);
        setUploadProgress(60);
        afterUrl = await uploadToCloudinary(afterFile);
        setUploadProgress(100);
      }

      await addDoc(collection(db, 'gallery'), {
        beforeUrl,
        afterUrl,
        mediaUrl: afterUrl, 
        type: 'before-after',
        category: 'before-after',
        caption: pairCaption,
        uploadedAt: serverTimestamp(),
        order: mediaItems.length
      });

      setBeforeFile(null);
      setAfterFile(null);
      setBeforePreview('');
      setAfterPreview('');
      setPairCaption('');
      setIsUploading(false);
      setUploadProgress(0);
      alert('Before-After pair uploaded successfully!');
    } catch (err) {
      console.error("Pair upload failed:", err);
      setErrorMsg(`Pair upload failed: ${err.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleUploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleUploadFile(file);
  };

  const handleUpdateCaption = async (id) => {
    try {
      await updateDoc(doc(db, 'gallery', id), {
        caption: captions[id] || ''
      });
      alert('Caption updated successfully!');
    } catch (err) {
      console.error("Error updating caption:", err);
      alert(`Could not save caption: ${err.message}`);
    }
  };

  const handleCategoryChange = async (id, category) => {
    try {
      await updateDoc(doc(db, 'gallery', id), { category });
    } catch (err) {
      console.error("Error updating category:", err);
      alert(`Could not update category: ${err.message}`);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm("Are you sure you want to delete this media item?")) return;

    try {
      if (item.type === 'before-after') {
        if (item.beforeUrl && (item.beforeUrl.includes('firebasestorage.googleapis.com') || item.beforeUrl.includes('127.0.0.1') || item.beforeUrl.includes('localhost'))) {
          try {
            await deleteObject(ref(storage, item.beforeUrl));
          } catch (storageErr) {
            console.warn("Storage deletion warning (beforeUrl):", storageErr);
          }
        }
        if (item.afterUrl && (item.afterUrl.includes('firebasestorage.googleapis.com') || item.afterUrl.includes('127.0.0.1') || item.afterUrl.includes('localhost'))) {
          try {
            await deleteObject(ref(storage, item.afterUrl));
          } catch (storageErr) {
            console.warn("Storage deletion warning (afterUrl):", storageErr);
          }
        }
      } else {
        if (item.mediaUrl && (item.mediaUrl.includes('firebasestorage.googleapis.com') || item.mediaUrl.includes('127.0.0.1') || item.mediaUrl.includes('localhost'))) {
          try {
            await deleteObject(ref(storage, item.mediaUrl));
          } catch (storageErr) {
            console.warn("Storage deletion warning:", storageErr);
          }
        }
      }

      await deleteDoc(doc(db, 'gallery', item.id));

      const remainingItems = mediaItems.filter(i => i.id !== item.id);
      if (remainingItems.length > 0) {
        const batch = writeBatch(db);
        remainingItems.forEach((remItem, idx) => {
          batch.update(doc(db, 'gallery', remItem.id), { order: idx });
        });
        await batch.commit();
      }
    } catch (err) {
      console.error("Error deleting gallery item:", err);
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleMove = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= mediaItems.length) return;

    try {
      const itemsClone = [...mediaItems];
      const temp = itemsClone[index];
      itemsClone[index] = itemsClone[newIndex];
      itemsClone[newIndex] = temp;

      const batch = writeBatch(db);
      itemsClone.forEach((item, idx) => {
        batch.update(doc(db, 'gallery', item.id), { order: idx });
      });
      await batch.commit();
    } catch (err) {
      console.error("Error reordering items:", err);
      alert(`Reordering failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Gallery Management</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Upload and organize photos, videos, and before-after pairs displayed in the public grid.
        </p>
      </div>

      {/* Upload Mode Selector */}
      <div className="flex space-x-2 border-b border-slate-200 pb-3 max-w-3xl">
        <button
          onClick={() => setUploadType('single')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            uploadType === 'single' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Single Photo / Video
        </button>
        <button
          onClick={() => setUploadType('pair')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            uploadType === 'pair' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Before-After Photo Pair
        </button>
      </div>

      {/* Dual Dropzone Upload Area */}
      {uploadType === 'pair' ? (
        <div className="max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800">Upload Before-After Image Pair</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Before Box */}
            <div className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-center h-40 relative bg-slate-50">
              {beforePreview ? (
                <div className="w-full h-full relative">
                  <img src={beforePreview} alt="Before Preview" className="w-full h-full object-cover rounded-lg" />
                  <button 
                    onClick={() => { setBeforeFile(null); setBeforePreview(''); }}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-slate-500 font-semibold text-[11px] gap-2">
                  <Upload className="h-5 w-5 text-slate-400" />
                  <span>Select Before Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setBeforeFile(file);
                        setBeforePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* After Box */}
            <div className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-center h-40 relative bg-slate-50">
              {afterPreview ? (
                <div className="w-full h-full relative">
                  <img src={afterPreview} alt="After Preview" className="w-full h-full object-cover rounded-lg" />
                  <button 
                    onClick={() => { setAfterFile(null); setAfterPreview(''); }}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-slate-500 font-semibold text-[11px] gap-2">
                  <Upload className="h-5 w-5 text-slate-400" />
                  <span>Select After Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setAfterFile(file);
                        setAfterPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-semibold text-slate-700">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Caption (Optional)
            </label>
            <input
              type="text"
              value={pairCaption}
              onChange={(e) => setPairCaption(e.target.value)}
              placeholder="e.g. Max's coat grooming trim..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 text-slate-800 transition-colors font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleUploadPair}
              disabled={isUploading || !beforeFile || !afterFile}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              {isUploading ? (
                <>
                  <Upload className="h-3.5 w-3.5 animate-bounce" />
                  <span>Uploading Pair ({uploadProgress}%)</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Upload Before-After Pair</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Drag & Drop Upload Area (Single) */
        <div className="max-w-3xl">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
              isDragOver 
                ? 'border-slate-800 bg-slate-50' 
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            {isUploading ? (
              <div className="space-y-3 w-full max-w-xs font-semibold text-xs text-slate-600">
                <Upload className="h-8 w-8 mx-auto text-slate-400 animate-bounce" />
                <p>Uploading to Firebase Storage...</p>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                  <div 
                    className="bg-slate-900 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">{uploadProgress}% Complete</p>
              </div>
            ) : (
              <div className="space-y-3 font-semibold text-xs text-slate-600">
                <Upload className="h-8 w-8 mx-auto text-slate-400" />
                <p>Drag and drop your pet image or video here, or</p>
                <label className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm">
                  Browse Files
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400">Supports JPG, PNG, GIF, MP4, MOV</p>
              </div>
            )}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 max-w-3xl flex items-center space-x-2 text-rose-600 text-xs font-bold bg-rose-50 border border-rose-200 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Media Items List */}
      <div>
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">
          Gallery Items ({mediaItems.length})
        </h3>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">
            Loading gallery manager...
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs font-semibold space-y-2">
            <Image className="h-8 w-8 mx-auto text-slate-300 stroke-1" />
            <p>No gallery items found. Select an upload mode above to start.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                {/* Visual Thumbnail */}
                <div className="h-48 bg-slate-100 relative flex items-center justify-center overflow-hidden border-b border-slate-200">
                  {item.type === 'before-after' ? (
                    <div className="grid grid-cols-2 w-full h-full divide-x divide-white">
                      <div className="relative h-full">
                        <img src={item.beforeUrl} alt="Before" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 bg-black/70 text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">Before</span>
                      </div>
                      <div className="relative h-full">
                        <img src={item.afterUrl} alt="After" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 bg-slate-900/90 text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">After</span>
                      </div>
                    </div>
                  ) : item.type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video src={item.mediaUrl} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white fill-current" />
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={item.mediaUrl} 
                      alt={item.caption || "Gallery item"} 
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Move & Order Badges */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1">
                    <span className="bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[9px] font-bold">
                      Order: {index + 1}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 flex items-center space-x-1 bg-slate-900/80 backdrop-blur-sm p-1 rounded-lg">
                    <button
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className="p-1 text-white hover:text-slate-300 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Move Up/Left"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 1)}
                      disabled={index === mediaItems.length - 1}
                      className="p-1 text-white hover:text-slate-300 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Move Down/Right"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Properties Form */}
                <div className="p-4 space-y-3 text-xs font-semibold text-slate-700">
                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      Category *
                    </label>
                    {item.type === 'before-after' ? (
                      <div className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-xs font-semibold">
                        Before-After (Locked)
                      </div>
                    ) : (
                      <select
                        value={item.category}
                        onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-800 transition-colors"
                      >
                        <option value="photos">Photos</option>
                        <option value="videos">Videos</option>
                        <option value="customer-pets">Customer Pets</option>
                      </select>
                    )}
                  </div>

                  {/* Caption Input */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      Caption (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={captions[item.id] || ''}
                        onChange={(e) => setCaptions({ ...captions, [item.id]: e.target.value })}
                        placeholder="Add media description..."
                        className="flex-grow px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-800 transition-colors"
                      />
                      <button
                        onClick={() => handleUpdateCaption(item.id)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Save Caption"
                      >
                        <Save className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action footer */}
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400">
                    {item.type} file
                  </span>
                  
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
