import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Star, Trash2, Plus, Sparkles, Award } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [formData, setFormData] = useState({
    reviewerName: '',
    reviewText: '',
    rating: 5,
    source: 'Google'
  });
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });

  // Fetch reviews on mount
  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reviewsList = [];
      querySnapshot.forEach((doc) => {
        reviewsList.push({ id: doc.id, ...doc.data() });
      });
      
      setReviews(reviewsList);

      // Trigger automatic seeding check if collection is empty
      if (reviewsList.length === 0 && !seeding) {
        await seedDatabase();
      }
    } catch (error) {
      console.error("Error fetching reviews in admin:", error);
    } finally {
      setLoading(false);
    }
  };

  // Seed the database with the real Google reviews
  const seedDatabase = async () => {
    setSeeding(true);
    try {
      const seedReviews = [
        {
          reviewerName: "Sailaja Tirupati",
          reviewText: "Had a great experience at Suzi Pet Store and Spa 🐾✨ The service was very good, staff were friendly and caring towards pets. The store is neat and well maintained. Wishing you lots of success ahead! 😊",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Neha N",
          reviewText: "Fantastic Experience! Fido and I love Suzi Pet Store & Spa! They take time to get to know your dog and make them feel comfortable while being groomed.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Akhil S",
          reviewText: "We had a wonderful experience at the Suzi Pet Store & Spa with our pet, Lusi. They were very caring, friendly, and handled her with so much love and patience. Lusi looked very happy, clean, and comfortable after the grooming session.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Tapan Dash",
          reviewText: "Awesome place where every pet gets personal attention. It is an extension of Suzi kennels and wish all the best to them. I am using their services since last 6 years and strongly recommend all pet owners to visit them.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Niharika S",
          reviewText: "At Suzi, the care is too good that I can just forget I left my pup there. They handle with extreme care. Any pet parent would be tension free. I would highly recommend Suzi pet store and spa. Even suzi kennels for their pet boarding.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Phani Kumar",
          reviewText: "Had a great experience at Suzi Pet Store and Spa. The staff took wonderful care of our pets, Bruno and Goofy, and the service was excellent. We are very happy with the experience and wish Suzi Pet Store continued growth and success. Highly recommended! 🐾❤️✨",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Shravya Manda",
          reviewText: "Great grooming service…. The staff were kind and professional, and my Tio came back looking adorable and well-groomed. Very satisfied with the experience ☺️",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Vinay Y",
          reviewText: "Have experienced Suzi team's genuine care and passion at their Kennel over the last 3 years. My pet's first visit to their newly opened Spa store has been highly satisfactory and loveable. Thank you.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "G S",
          reviewText: "Excellent grooming service, very clean setup and super friendly staff. Suzi Pet Store and SPA handled my pet with great care and professionalism. Highly recommend.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Vijaya Nagakumari",
          reviewText: "We had a wonderful experience at Suzi Pet Store and Spa. My pet Dobby thoroughly enjoyed his pampering spa session and came back looking fresh, happy, and relaxed. The staff were caring, gentle, and professional.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "suneeta k",
          reviewText: "Highly satisfied with the Suzi Pet Store & Spa service. The environment was clean, friendly, and comfortable for pets. Shiro looked fresh, happy, and beautifully groomed after the session. Thank you for the wonderful care.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Narasimha Sharma",
          reviewText: "I've known the team at Suzi Pet Store & Spa for over 2.5 years now, and I can genuinely say they care for every puppy like their own. My pet Lucky has been pampered by them countless times, and the love and attention they show is something special.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Hasini Reddy",
          reviewText: "Awesome service... Jimmi looks happy after the session. Thank you Suzi pet store and spa for your amazing service.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Jyothi Namala",
          reviewText: "Best grooming place ...👌 Your services is very good..",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Maddu Shekar",
          reviewText: "I am very satisfied with your service and worth price...",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "varun p.n",
          reviewText: "Very well maintained , handles with lot of care .",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Lolla Abhijith",
          reviewText: "Excellent service, neat and clean premises. Highly recommend!",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Sanjana Sharma",
          reviewText: "I had a wonderful experience at this pet spa! The staff were friendly, caring, and treated my pet with so much love and patience. The grooming was excellent, and my pet came back looking clean, happy, and well-groomed. Highly recommend!",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Nagarjuna Nag",
          reviewText: "I am very happy with the store and service they provided for my Subbu ... Neat and hygienic environment..much recommended place for the pet parents.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "BHAVYA RAO",
          reviewText: "I had a wonderful experience at Suzi Pet Spa and Store! The staff were extremely friendly, caring, and professional. They treated my pet with so much love and attention, making us feel comfortable from the moment we arrived.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Bussa Venkata Raghuram",
          reviewText: "Great experience. Very hygienic and professional setup. The groomer is also very patient and gentle with dogs. Glad to have come across this place.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Preetha Nair",
          reviewText: "I took my two Persian cats to Suzi pet store and spa for grooming service. The staff were gentle, patient and handled my pets with care. After grooming my cat's fur was silky, tangle-free, and both smelled fresh. The environment was welcoming.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Jia Jithesh",
          reviewText: "A wonderful addition for all pet parents..The grooming centre is clean, welcoming, and staffed by caring professionals who treat every pet with love and patience. The attention to detail and commitment to pet comfort truly stand out.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Tej Anand",
          reviewText: "I recently took my German Shepherd to Suzi pet spa for grooming, and I was very impressed with the experience. The facility was extremely clean, hygienic, and well maintained. The staff was professional, friendly, and clearly experienced.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Keka Haldar",
          reviewText: "All our fur baby's requirements, treats and toys under one roof. 👍",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Yeshasvi",
          reviewText: "Brought my pet in for a bath and trim, and they did a fantastic job! Super clean, beautifully even trim, and smells amazing. Highly recommend!",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Anand Varma",
          reviewText: "Our experience in Suzi Kenal was very good. They took good care of your pet and the service and everything else was also very appreciative!! The ambience and interior is also very comfortable and cool.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "RADHIKA NARASIMHAN",
          reviewText: "Took Alpha, my Golden Retriever, here for a full grooming session and wow! He came back fluffy, shiny, and smelling amazing. The staff was so gentle with him. Best pet spa in Hyderabad. Highly recommend!",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "divya pendayla",
          reviewText: "I had an amazing experience with Suzi Pet Store and Spa! While I have trusted their kennel services before, this was the first time I brought my two pets, Bruno and Goofy, for spa and bathing services, and I am extremely satisfied.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Zainab Eranpurwala",
          reviewText: "Had a wonderful experience at Suzi Pet Store & Spa! 🐾 The staff was friendly, caring, and professional. My pet was treated with so much love and came back looking clean, happy, and well-groomed. Highly recommend.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        },
        {
          reviewerName: "Sujata D",
          reviewText: "No words to describe ,whatever word i use it will be less, its not only a shop its a paradise for all, neverever seen such an honest person like you who fully cares animals and mostly experienced.",
          rating: 5,
          source: "Google",
          createdAt: new Date()
        }
      ];

      for (const review of seedReviews) {
        await addDoc(collection(db, 'reviews'), review);
      }

      // Re-fetch reviews after seeding
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reviewsList = [];
      querySnapshot.forEach((doc) => {
        reviewsList.push({ id: doc.id, ...doc.data() });
      });
      setReviews(reviewsList);
    } catch (err) {
      console.error("Seeding error:", err);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!formData.reviewText.trim()) {
      setStatus({ loading: false, success: '', error: 'Review text cannot be empty.' });
      return;
    }

    setStatus({ loading: true, success: '', error: '' });
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        reviewerName: formData.reviewerName.trim() || 'Anonymous',
        reviewText: formData.reviewText.trim(),
        rating: Number(formData.rating),
        source: formData.source,
        createdAt: serverTimestamp()
      });

      setStatus({ loading: false, success: 'Review added successfully!', error: '' });
      setFormData({ reviewerName: '', reviewText: '', rating: 5, source: 'Google' });
      fetchReviews();
    } catch (err) {
      console.error("Error adding review:", err);
      setStatus({ loading: false, success: '', error: `Failed to add review: ${err.message}` });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
      alert(`Could not delete review: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reviews & Testimonials</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Manage reviews displayed in the homepage carousel.
          </p>
        </div>

        <button
          onClick={seedDatabase}
          disabled={seeding || loading}
          className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>{seeding ? 'Seeding...' : 'Reset Default Reviews'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column (4 columns) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
            <Plus className="h-4 w-4 mr-1.5 text-slate-600" />
            Add New Review
          </h3>

          <form onSubmit={handleAddReview} className="space-y-4 text-xs font-semibold text-slate-700">
            {/* Review Source */}
            <div className="space-y-1">
              <label htmlFor="source" className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Source Category *
              </label>
              <select
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 text-slate-800 transition-colors"
                required
              >
                <option value="Google">Google Review</option>
                <option value="Direct">Direct/In-Store Quote</option>
              </select>
            </div>

            {/* Rating */}
            <div className="space-y-1">
              <label htmlFor="rating" className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Rating Stars *
              </label>
              <select
                id="rating"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 text-slate-800 transition-colors"
                required
              >
                <option value={5}>5 Stars (★★★★★)</option>
                <option value={4}>4 Stars (★★★★☆)</option>
                <option value={3}>3 Stars (★★★☆☆)</option>
                <option value={2}>2 Stars (★★☆☆☆)</option>
                <option value={1}>1 Star (★☆☆☆☆)</option>
              </select>
            </div>

            {/* Reviewer Name */}
            <div className="space-y-1">
              <label htmlFor="reviewerName" className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Reviewer Name *
              </label>
              <input
                id="reviewerName"
                type="text"
                value={formData.reviewerName}
                onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
                placeholder="e.g. Sailaja Tirupati"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 text-slate-800 transition-colors font-medium"
                required
              />
            </div>

            {/* Review Text */}
            <div className="space-y-1">
              <label htmlFor="reviewText" className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Review Text (Quote verbatim) *
              </label>
              <textarea
                id="reviewText"
                rows="4"
                value={formData.reviewText}
                onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                placeholder="Type the review content here..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 text-slate-800 resize-none transition-colors"
                required
              />
            </div>

            {status.error && (
              <p className="text-xs text-rose-600 font-bold">{status.error}</p>
            )}
            {status.success && (
              <p className="text-xs text-emerald-600 font-bold">{status.success}</p>
            )}

            <button
              type="submit"
              disabled={status.loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>{status.loading ? 'Adding...' : 'Publish Review'}</span>
            </button>
          </form>
        </div>

        {/* Display List Column (8 columns) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Published Reviews ({reviews.length})
            </h3>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              Live
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              Loading reviews list...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold space-y-2">
              <Award className="h-8 w-8 mx-auto text-slate-300 stroke-1" />
              <p>No reviews added yet. Seed the database or write one.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 flex justify-between items-start gap-4">
                  <div className="space-y-2 text-xs font-semibold text-slate-700">
                    {/* Stars */}
                    <div className="flex items-center space-x-0.5 text-amber-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    {/* Text */}
                    <p className="text-slate-800 text-sm font-medium leading-relaxed italic">
                      "{review.reviewText}"
                    </p>
                    {review.reviewerName && (
                      <p className="text-slate-900 font-bold text-xs mt-1">
                        — {review.reviewerName}
                      </p>
                    )}
                    {/* Meta details */}
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {review.source}
                      </span>
                      <span>&bull;</span>
                      <span>
                        {review.createdAt?.toDate 
                          ? review.createdAt.toDate().toLocaleDateString('en-IN') 
                          : 'Just now'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0"
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
