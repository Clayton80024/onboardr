'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Share2, Copy } from 'lucide-react'

interface QRCodeComponentProps {
  url: string
  title?: string
  description?: string
  size?: number
  logoSize?: number
}

export default function QRCodeComponent({ 
  url, 
  title = "Scan to Access", 
  description = "Scan this QR code with your phone to access the onboarding",
  size = 256,
  logoSize = 60
}: QRCodeComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateQR = async () => {
      try {
        console.log('Generating QR code for URL:', url)
        setIsLoading(true)
        
        // Generate QR code with custom options for better appearance
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: '#1f2937', // Dark gray for better contrast
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        })
        
        console.log('QR code generated successfully')
        setQrDataUrl(qrDataUrl)
        setIsLoading(false)
      } catch (error) {
        console.error('Error generating QR code:', error)
        setIsLoading(false)
      }
    }

    if (url) {
      generateQR()
    }
  }, [url, size])

  const downloadQR = () => {
    if (!qrDataUrl) return
    
    const link = document.createElement('a')
    link.download = 'wepply-qr-code.png'
    link.href = qrDataUrl
    link.click()
  }

  const copyQR = async () => {
    if (!qrDataUrl) return
    
    try {
      const response = await fetch(qrDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
    } catch (error) {
      console.error('Failed to copy QR code:', error)
    }
  }

  const shareQR = async () => {
    if (!qrDataUrl) return
    
    try {
      const response = await fetch(qrDataUrl)
      const blob = await response.blob()
      if (navigator.share) {
        const file = new File([blob], 'wepply-qr-code.png', { type: 'image/png' })
        await navigator.share({
          title: 'Wepply QR Code',
          text: 'Scan this QR code to access Wepply onboarding',
          files: [file]
        })
      }
    } catch (error) {
      console.error('Failed to share QR code:', error)
    }
  }

  // If no title/description, render minimal version
  if (!title && !description) {
    return (
      <div className="flex justify-center">
        <div className="relative">
          {isLoading ? (
            <div 
              className="flex items-center justify-center bg-gray-100 rounded-lg"
              style={{ width: size, height: size }}
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="rounded-lg shadow-lg"
              style={{ width: size, height: size }}
            />
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center">
          <div className="relative">
            {isLoading ? (
              <div 
                className="flex items-center justify-center bg-gray-100 rounded-lg"
                style={{ width: size, height: size }}
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="rounded-lg shadow-lg border-2 border-gray-200"
                style={{ width: size, height: size }}
              />
            ) : null}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadQR}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={copyQR}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </Button>
          
          {'share' in navigator && (
            <Button
              variant="outline"
              size="sm"
              onClick={shareQR}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          )}
        </div>

        {/* URL Display */}
        <div className="text-center">
          <p className="text-xs text-gray-500 break-all">{url}</p>
        </div>
      </CardContent>
    </Card>
  )
}
