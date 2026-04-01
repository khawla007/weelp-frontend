'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Upload, Loader2 } from 'lucide-react';
import { createPost } from '@/lib/actions/posts';

export default function CreatePostModal({ open, onOpenChange, onPostCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searching, setSearching] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!open) {
      reset();
      setMediaFile(null);
      setMediaPreview(null);
      setSelectedItems([]);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [open, reset]);

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

    const result = await createPost(formData);

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
          <DialogTitle className="text-[#142A38] text-xl">Create Post</DialogTitle>
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
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items to tag..."
              className="mt-2 w-full px-3 py-2 border border-[#435a6742] rounded-lg text-sm focus:outline-none focus:border-secondaryDark"
            />

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-1 max-h-40 overflow-y-auto border border-[#435a6742] rounded-lg bg-white shadow-sm">
                {searchResults.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => addItem(item)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#CFDBE54D] transition-colors flex justify-between items-center"
                  >
                    <span className="text-[#142A38]">{item.name}</span>
                    <span className="text-xs text-[#5A5A5A] capitalize">{item.type_label}</span>
                  </button>
                ))}
              </div>
            )}

            {searching && <p className="text-xs text-[#5A5A5A] mt-1">Searching...</p>}

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
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
            {submitting ? 'Publishing...' : 'Publish Post'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
