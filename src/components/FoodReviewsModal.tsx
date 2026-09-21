import React, { useState } from 'react';
import { X, Star, MessageSquare, Send, Check, User, Sparkles } from 'lucide-react';
import { FoodItem, Review } from '../types';
import { submitStudentReview } from '../services/foodService';
import { useAuth } from '../context/AuthContext';
import { DietaryBadge } from './DietaryBadge';
import { handleImageError } from '../utils/imageUtils';
import confetti from 'canvas-confetti';

interface FoodReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: FoodItem | null;
  reviews: Review[];
}

export const FoodReviewsModal: React.FC<FoodReviewsModalProps> = ({
  isOpen,
  onClose,
  food,
  reviews
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [studentName, setStudentName] = useState(user?.displayName || '');
  const [studentYear, setStudentYear] = useState(user?.studentId ? `${user.studentId} • Student` : '2nd Year CSE');
  const [selectedTag, setSelectedTag] = useState('Crispy perfection');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen || !food) return null;

  const foodReviews = reviews.filter((r) => r.foodId === food.id);

  const REVIEW_TAGS = [
    'Crispy perfection',
    'Worth every rupee',
    'Late Night Craving',
    'Study Fuel',
    'South Indian Gem',
    'Spicy & Flavourful',
    'Light Snack'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !studentName.trim()) return;

    setIsSubmitting(true);
    try {
      await submitStudentReview(
        food.id,
        food.name,
        studentName,
        studentYear,
        rating,
        comment,
        selectedTag
      );

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSubmitSuccess(true);
      setComment('');
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="food-reviews-modal"
        className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col"
      >
        <button
          id="close-reviews-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Dish Info */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100 shrink-0">
          <img
            src={food.imageUrl}
            alt={food.name}
            onError={(e) => handleImageError(e, food.category, food.dietary)}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-2xl object-cover shadow-xs bg-slate-100 border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 font-['Outfit'] leading-snug">
                {food.name}
              </h3>
              <DietaryBadge dietary={food.dietary} isVeg={food.isVeg} size="sm" />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center text-amber-500 font-black text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                <span>{food.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-slate-400">
                • {food.reviewsCount} verified student reviews
              </span>
              <span className="text-xs font-black text-slate-800 ml-1 font-['Outfit']">
                ₹{food.price}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* Write a Review Section */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Leave a Campus Review</span>
            </h4>

            {submitSuccess ? (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Thank you! Your review is now live for all students.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Star rating selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-115"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            (hoverRating || rating) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-black text-amber-700 ml-2 font-['Outfit']">
                    {rating} / 5 Stars
                  </span>
                </div>

                {/* Name and Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Your Name (e.g. Rahul K)"
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                  <input
                    type="text"
                    value={studentYear}
                    onChange={(e) => setStudentYear(e.target.value)}
                    placeholder="Year & Branch (e.g. 2nd Yr ECE)"
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>

                {/* Tag selector */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-600">Quick student tag:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {REVIEW_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          selectedTag === tag
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <textarea
                  required
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the taste, crunch, spice or portion size? Help your batchmates..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium resize-none"
                />

                <button
                  id="submit-review-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Posting...' : 'Post Student Review'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Existing Reviews List */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Student Experiences ({foodReviews.length})
            </h4>

            {foodReviews.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200">
                <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-600">No reviews yet for this dish!</p>
                <p className="text-[11px] text-slate-400">Be the first student to review it above</p>
              </div>
            ) : (
              foodReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                        {rev.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{rev.studentName}</p>
                        <p className="text-[10px] text-slate-400">{rev.studentYear}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                      {rev.tag}
                    </span>
                    <span className="text-slate-400">{rev.createdAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
