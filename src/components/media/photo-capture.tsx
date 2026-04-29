'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, X, Upload } from 'lucide-react'
import imageCompression from 'browser-image-compression'

export interface CapturedPhoto {
  id: string
  file: File
  thumbnailFile: File
  previewUrl: string
}

interface PhotoCaptureProps {
  onPhotosChange: (photos: CapturedPhoto[]) => void
}

export function PhotoCapture({ onPhotosChange }: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCaptureClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    setIsProcessing(true)
    
    const newPhotos = [...photos]
    
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i]
      
      try {
        // Compress for original (max 5MB, reasonably sized)
        const originalOptions = {
          maxSizeMB: 5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        }
        
        // Compress for thumbnail (max 50KB, small)
        const thumbnailOptions = {
          maxSizeMB: 0.05,
          maxWidthOrHeight: 400,
          useWebWorker: true,
        }
        
        const compressedFile = await imageCompression(file, originalOptions)
        const thumbnailFile = await imageCompression(file, thumbnailOptions)
        
        const previewUrl = URL.createObjectURL(thumbnailFile)
        
        newPhotos.push({
          id: Math.random().toString(36).substring(7),
          file: compressedFile,
          thumbnailFile,
          previewUrl
        })
      } catch (error) {
        console.error("Error compressing image", error)
      }
    }
    
    setPhotos(newPhotos)
    onPhotosChange(newPhotos)
    setIsProcessing(false)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removePhoto = (id: string) => {
    const updated = photos.filter(p => p.id !== id)
    setPhotos(updated)
    onPhotosChange(updated)
    
    // Cleanup URL object
    const removed = photos.find(p => p.id === id)
    if (removed) {
      URL.revokeObjectURL(removed.previewUrl)
    }
  }

  return (
    <div className="space-y-4">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        multiple 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map(photo => (
          <div key={photo.id} className="relative aspect-square border rounded-md overflow-hidden bg-muted group">
            <img src={photo.previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={(e) => { e.preventDefault(); removePhoto(photo.id); }}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-80 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <Card 
          className="aspect-square border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={handleCaptureClick}
        >
          <CardContent className="p-0 flex flex-col items-center justify-center text-muted-foreground h-full">
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <span className="text-xs">Processing...</span>
              </div>
            ) : (
              <>
                <Camera className="h-8 w-8 mb-2 text-primary/70" />
                <span className="text-sm font-medium">Add Photo</span>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
