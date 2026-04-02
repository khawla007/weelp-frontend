'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Upload, Loader2, Link, Search, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { createPost, updatePost, getCompletedBookings, resolveLink } from '@/lib/actions/posts';

export default function CreatePostModal({ open, onOpenChange, onPostCreated, initialData }) {
  const [submitting, setSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searching, setSearching] = useState(false);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [resolvingLink, setResolvingLink] = useState(false);
  const [linkError, setLinkError] = useState(null);
  const [showPasteLink, setShowPasteLink] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (open) {
      // If editing, populate form with initial data
      if (isEditing && initialData) {
        reset({ caption: initialData.caption || '' });
        if (initialData.media_url) {
          setMediaPreview(initialData.media_url);
        }
        if (initialData.tagged_items) {
          setSelectedItems(
            initialData.tagged_items.map((item) => ({
              taggable_id: item.taggable_id,
              taggable_type: item.taggable_type,
              name: item.name,
            })),
          );
        }
      }

      const fetchBookings = async () => {
        setLoadingBookings(true);
        const result = await getCompletedBookings();
        if (result.success) {
          setCompletedBookings(result.data);
        } else {
          setCompletedBookings([]);
          setShowPasteLink(true);
          setShowSearch(true);
        }
        setLoadingBookings(false);
      };
      fetchBookings();
    } else {
      reset();
      setMediaFile(null);
      setMediaPreview(null);
      setSelectedItems([]);
      setSearchQuery('');
      setSearchResults([]);
      setCompletedBookings([]);
      setLoadingBookings(false);
      setLinkInput('');
      setLinkError(null);
      setResolvingLink(false);
      setShowPasteLink(false);
      setShowSearch(false);
    }
  }, [open, reset, isEditing, initialData]);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  useEffect(() => {
    const searchItems = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const res = await fetch(`/api/public/search-items?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching items:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchItems, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const addItem = (item) => {
    if (!selectedItems.find((i) => i.taggable_id === item.id && i.taggable_type === item.type)) {
      setSelectedItems((prev) => [...prev, { taggable_id: item.id, taggable_type: item.type, name: item.name }]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResolveLink = async () => {
    if (!linkInput.trim()) return;
    setResolvingLink(true);
    setLinkError(null);

    const result = await resolveLink(linkInput.trim());

    if (result.success) {
      const item = result.data;
      if (selectedItems.find((i) => i.taggable_id === item.item_id && i.taggable_type === item.item_type)) {
        setLinkError('This item is already tagged.');
      } else {
        setSelectedItems((prev) => [...prev, { taggable_id: item.item_id, taggable_type: item.item_type, name: item.item_name }]);
        setLinkInput('');
        setShowPasteLink(false);
      }
    } else {
      setLinkError(result.message);
    }

    setResolvingLink(false);
  };

  const isItemSelected = (itemId, itemType) => {
    return selectedItems.some((i) => i.taggable_id === itemId && i.taggable_type === itemType);
  };

  const isMaxReached = selectedItems.length >= 3;

  const onSubmit = async (data) => {
    setSubmitting(true);

    const formData = new FormData();
    formData.append('caption', data.caption);

    if (mediaFile) {
      formData.append('media_file', mediaFile);
    }

    selectedItems.forEach((item, index) => {
      formData.append(`tagged_items[${index}][taggable_id]`, item.taggable_id);
      formData.append(`tagged_items[${index}][taggable_type]`, item.taggable_type);
    });

    // Use updatePost if editing, createPost otherwise
    const result = isEditing ? await updatePost(initialData.id, formData) : await createPost(formData);

    if (result.success) {
      onOpenChange(false);
      if (onPostCreated) onPostCreated(result.data);
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#142A38] text-xl">{isEditing ? 'Edit Post' : 'Create Post'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Media Upload */}
          <div>
            <Label className="text-[#435A67] text-sm font-medium">Media</Label>
            {mediaPreview ? (
              <div className="relative mt-2 rounded-lg overflow-hidden">
                <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                <button type="button" onClick={removeMedia} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#435a6742] rounded-lg cursor-pointer hover:border-secondaryDark transition-colors">
                <Upload size={24} className="text-[#435A67] mb-2" />
                <span className="text-sm text-[#435A67]">Click to upload image or video</span>
                <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Caption */}
          <div>
            <Label htmlFor="caption" className="text-[#435A67] text-sm font-medium">
              Caption
            </Label>
            <Textarea
              id="caption"
              placeholder="Share your travel experience..."
              className="mt-2 min-h-[100px]"
              {...register('caption', { required: 'Caption is required', maxLength: { value: 2000, message: 'Max 2000 characters' } })}
            />
            {errors.caption && <p className="text-red-500 text-xs mt-1">{errors.caption.message}</p>}
          </div>

          {/* Tag Items */}
          <div>
            <Label className="text-[#435A67] text-sm font-medium">Tag Activities / Packages / Itineraries</Label>

            {/* Max limit notice */}
            {isMaxReached && <p className="text-xs text-amber-600 mt-2">Maximum 3 items tagged.</p>}

            {/* Primary: My Bookings */}
            {!isMaxReached && (
              <div className="mt-2">
                <p className="text-xs text-[#5A5A5A] mb-1.5">Select from your completed bookings</p>
                {loadingBookings ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-14 bg-[#CFDBE54D] rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : completedBookings.length > 0 ? (
                  <div className="max-h-[200px] overflow-y-auto space-y-1.5 border border-[#435a6742] rounded-lg p-2">
                    {completedBookings.map((booking) => {
                      const selected = isItemSelected(booking.item_id, booking.item_type);
                      return (
                        <button
                          key={booking.order_id}
                          type="button"
                          disabled={selected}
                          onClick={() => addItem({ id: booking.item_id, type: booking.item_type, name: booking.item_name })}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                            selected ? 'opacity-40 cursor-not-allowed bg-[#CFDBE54D]' : 'hover:bg-[#CFDBE54D] cursor-pointer'
                          }`}
                        >
                          {booking.item_image ? (
                            <img src={booking.item_image} alt={booking.item_name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-[#CFDBE54D] flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#142A38] truncate">{booking.item_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-medium text-secondaryDark bg-secondaryDark/10 px-1.5 py-0.5 rounded">{booking.type_label}</span>
                              <span className="text-[10px] text-[#5A5A5A] flex items-center gap-0.5">
                                <Calendar className="size-2.5" />
                                {booking.travel_date}
                              </span>
                            </div>
                          </div>
                          {selected && <span className="text-[10px] text-[#5A5A5A]">Tagged</span>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#5A5A5A] italic py-3 text-center border border-dashed border-[#435a6742] rounded-lg">No completed bookings yet</p>
                )}
              </div>
            )}

            {/* Secondary: Paste Link */}
            {!isMaxReached && (
              <div className="mt-3">
                <button type="button" onClick={() => setShowPasteLink((prev) => !prev)} className="flex items-center gap-1.5 text-xs text-secondaryDark hover:text-secondaryDark/80 transition-colors">
                  {showPasteLink ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  <Link className="size-3" />
                  Or paste a Weelp link
                </button>
                {showPasteLink && (
                  <div className="mt-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={linkInput}
                        onChange={(e) => {
                          setLinkInput(e.target.value);
                          setLinkError(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleResolveLink())}
                        placeholder="e.g. https://weelp.com/activities/dubai-safari"
                        className="flex-1 px-3 py-2 border border-[#435a6742] rounded-lg text-sm focus:outline-none focus:border-secondaryDark"
                      />
                      <Button type="button" onClick={handleResolveLink} disabled={resolvingLink || !linkInput.trim()} className="bg-secondaryDark hover:bg-secondaryDark/90 text-white px-3" size="sm">
                        {resolvingLink ? <Loader2 className="size-3.5 animate-spin" /> : 'Add'}
                      </Button>
                    </div>
                    {linkError && <p className="text-xs text-red-500 mt-1">{linkError}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Tertiary: Search by name */}
            {!isMaxReached && (
              <div className="mt-2">
                <button type="button" onClick={() => setShowSearch((prev) => !prev)} className="flex items-center gap-1.5 text-xs text-secondaryDark hover:text-secondaryDark/80 transition-colors">
                  {showSearch ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  <Search className="size-3" />
                  Or search by name
                </button>
                {showSearch && (
                  <div className="mt-1.5">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search items to tag..."
                      className="w-full px-3 py-2 border border-[#435a6742] rounded-lg text-sm focus:outline-none focus:border-secondaryDark"
                    />
                    {searchResults.length > 0 && (
                      <div className="mt-1 max-h-40 overflow-y-auto border border-[#435a6742] rounded-lg bg-white shadow-sm">
                        {searchResults.map((item) => (
                          <button
                            key={`${item.type}-${item.id}`}
                            type="button"
                            disabled={isItemSelected(item.id, item.type)}
                            onClick={() => addItem(item)}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors flex justify-between items-center ${
                              isItemSelected(item.id, item.type) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#CFDBE54D]'
                            }`}
                          >
                            <span className="text-[#142A38]">{item.name}</span>
                            <span className="text-xs text-[#5A5A5A] capitalize">{item.type_label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searching && <p className="text-xs text-[#5A5A5A] mt-1">Searching...</p>}
                  </div>
                )}
              </div>
            )}

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedItems.map((item, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-[#CFDBE54D] text-grayDark">
                    {item.name}
                    <button type="button" onClick={() => removeItem(index)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" disabled={submitting} className="w-full bg-secondaryDark hover:bg-secondaryDark/90 text-white">
            {submitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            {submitting ? (isEditing ? 'Updating...' : 'Publishing...') : isEditing ? 'Update Post' : 'Publish Post'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
