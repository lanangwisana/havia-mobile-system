"use client";

import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { EditProfileContent } from '@/components/content/EditProfileContent';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { postToApi } from '@/app/actions';

export default function EditProfilePage() {
  const { userData, apiToken, showToast, setUserData } = useAuth();
  const router = useRouter();

  const [editForm, setEditForm] = useState<any>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  useEffect(() => {
    if (userData) {
      setEditForm(userData);
    }
  }, [userData]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const payload = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        job_title: editForm.job_title,
      };
      const res = await postToApi('haviacms/update-profile', apiToken, payload);
      if (res.success) {
        showToast('Profile Updated');
        setUserData({ ...userData, ...payload });
        router.back();
      } else {
        showToast(res.error || 'Failed to update profile');
      }
    } catch (e) {
      showToast('Error connecting to server');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profile_image', file);
      
      const res = await fetch(`https://brain.havia.id/index.php/api/haviacms/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.avatar_url) {
        showToast('Photo Updated!');
        setUserData({ ...userData, avatar_url: data.avatar_url });
      } else {
        showToast(data.message || 'Failed to upload photo');
      }
    } catch (e) {
      showToast('Upload error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    setIsDeletingImage(true);
    try {
      const res = await postToApi('haviacms/delete-profile-image', apiToken, {});
      if (res.success) {
        showToast('Photo Removed!');
        setUserData({ ...userData, avatar_url: null });
      } else {
        showToast(res.error || 'Failed to remove photo');
      }
    } catch (e) {
      showToast('Error connecting to server');
    } finally {
      setIsDeletingImage(false);
    }
  };

  return (
    <PageWrapper title="Edit Profile" backRoute="/account">
      <EditProfileContent 
        userData={userData}
        editForm={editForm}
        setEditForm={setEditForm}
        handleSaveProfile={handleSaveProfile}
        isSavingProfile={isSavingProfile}
        onCancel={() => router.back()}
        onUploadImage={handleUploadImage}
        isUploadingImage={isUploadingImage}
        onDeleteImage={handleDeleteImage}
        isDeletingImage={isDeletingImage}
      />
    </PageWrapper>
  );
}
