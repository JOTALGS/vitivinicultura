import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Cookies from 'js-cookie';
import emailjs from '@emailjs/browser';
import VirtualKeyboard from './Keyboard';

// Dropbox API endpoints
const DROPBOX_UPLOAD_URL = 'https://content.dropboxapi.com/2/files/upload';
const DROPBOX_SHARE_URL = 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings';
const DROPBOX_ACCESS_TOKEN = 'sl.u.AFy9o6aKzZnRF3UbRPt1U7DfRomsMu-Haz0DFyoSnGeTrEkVMFWqR-H1RUj13E3BgGoYL9hfTkfiZk0ZlaTLvHtNIiu3M4ChkOmXWEr3Ae1zLgjlFR_CYRTWbCmow4zWaTeHlj-9jlWxkGos6xYbWztUspIbRTyo5imAIPHuqSXyw1RklZcJTNQ0Ajy5ActKaVCIbk_lYmQIohhO_futhMLKbgTvoJcqPID7s6KRGfnfkJWFmHwwHLvDYixnI3ty3cz7FosFsn9H5mKTYzLXjTsZ5wqwlScGm3HBBr32MgqHKwfjQx0v5o_-c4KQlFAOktUKUPeZIbYR5uCdMM5xv02n3Hj1fMzf-va1Z7k7Lq-6Wsqk_KskrIPF24RjxpSfv6nLrEZqDXQ16dQKZCbPw5-xWYYgz9_y35dlqMmnosjqIlsxV9C7C3cRuvQkOon8pXQjL-sZikW38CR1lMHTbsbxEOD8pf_w40FbyOxmsa1w-io-zam4QWvScEj8TDCprl_ul-jvPdz9Q7GJ-ctxycW_jY3mOhIbFrWrtt1iUlXmDY2eNzXKdwc_FroIEnRN5uxJVXTSGZt_Ap20bogarkJDDtj40VrPgfrYNSPJkcLUX-jgsgkVEyGs0miPWcyl3wXs2aGbBi5AIRwSuqA5cVfHBQgxaTuAvmqVIIt1Fha7ok51_gJgxGNGHoNZACOZW9cmDVCiuokM5LI8OBSAP677xpKtAW8IzyEuUlY1IlC5WRcG1ZuSKUiDNREI2W9txpS_Fk73KcqfeGTDDS-2qff65VvH1yGN1ejlmI6Sf2Cx5TlStarc0FuV3E0uZKx5dWBdcR722kPV4Zj9STEbPKU9Td9FtG1wNwJG5n6ASMC_wdJI1HVTJYqFHv1j9BAhVRJa56chD1Eiz1ydcSsqm8LaNF_0Hq3gqqeBfvOOabhaIoXni8SDTTHf2nglkEHc89dwV0uH66nVA9AofzwOM6RyegFGuynSKluvLTZGigMp35EFNZoUrpYza0GRb5XyK1tA3NMzjIvaXYDf_HSrkPeEnSOgPKYdvy_PtVclqwgmRYkqO_xTgEgMm-mLlgl0x79RxuCzNZPTKV98-NsCFVD5Of-ZErhPWxIF7wjVsIFOsv210PSiT1x36Uy0Tdl2IMnE97WMr_JmRtMeDLuuf7erjrN73mRHWShEpwbjQBwjnA6It0_8dMJ8qWigK2IDgC_dVgUpKH8jlme6qBZAdoLC-6pUH_jeIJB8jdaDzvzBUaZkv_tSYh7mcqAXyblgNbxKiYfMfjEgEZRZDiltTlwDTbKVxn02aQo-lf26GuTXvwFuvcVCKYZGWU1vksQg1vkPi9xPgmbkiKeqs7cPzELwQIAgjD36l1U_FY-fHHoKp2X-RlXQ2zlGUcHnh7IE895C1XEU1AdZkh3EijU_y6xkLjPe1Zwy0UtRe5Q1tHCrYw';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_lzdx8mk';
const EMAILJS_TEMPLATE_ID = 'template_6vqzqcd';
const EMAILJS_PUBLIC_KEY = 'LSsVMkGBfBQzbA1qv';

export default function ItinerarySender({ locations }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const formRef = useRef();
  const emailRef = useRef(null);

  const handleKeyboardChange = (value) => {
    setEmail(value);
    console.log('Current email value:', value);
  }

  // Function to clean text and remove problematic unicode characters
  const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
      .replace(/[""'']/g, '"') // Replace smart quotes with regular quotes
      .replace(/[–—]/g, '-') // Replace em/en dashes with hyphens
      .replace(/…/g, '...') // Replace ellipsis
      .trim();
  };

  const generatePdf = async (locations) => {
    console.log('Generating PDF for locations:', locations);
    
    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Constants for layout
    const pageWidth = 600;
    const pageHeight = 800;
    const margin = 30;
    const footerHeight = 40;
    const cardWidth = (pageWidth - 3 * margin) / 2;
    const cardHeight = (pageHeight - 2 * margin - footerHeight) / 2;
    const padding = 10;
    const maxContentWidth = cardWidth - 2 * padding;
    
    // Helper to truncate text
    const truncateWords = (text, maxWords) => {
      const cleanedText = cleanText(text);
      const words = cleanedText.split(/\s+/);
      if (words.length > maxWords) {
        return words.slice(0, maxWords).join(' ') + '...';
      }
      return cleanedText;
    };

    // Helper to wrap text with unicode cleaning
    const wrapText = (text, font, fontSize, maxWidth) => {
      const cleanedText = cleanText(text);
      const lines = [];
      let currentLine = '';

      const words = cleanedText.split(/\s+/);
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      
      return lines;
    };

    // Split locations into chunks of 4
    const locationChunks = [];
    for (let i = 0; i < locations.length; i += 4) {
      locationChunks.push(locations.slice(i, i + 4));
    }

    // Create pages
    for (const chunk of locationChunks) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      
      // Create cards (2x2 grid)
      for (let i = 0; i < chunk.length; i++) {
        const location = chunk[i];
        const row = Math.floor(i / 2);
        const col = i % 2;
        
        const cardX = margin + col * (cardWidth + margin);
        const cardY = pageHeight - margin - row * (cardHeight + margin) - cardHeight;
        
        // Draw card background/border
        page.drawRectangle({
          x: cardX,
          y: cardY,
          width: cardWidth,
          height: cardHeight,
          borderWidth: 1,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderOpacity: 0.5,
        });
        
        let contentY = cardY + cardHeight - padding;
        const minY = cardY + padding;
        
        // Location name/number - clean the text first
        const cleanName = cleanText(location.name || '');
        const nameLines = wrapText(cleanName, fontBold, 14, maxContentWidth);
        for (const line of nameLines) {
          if (contentY < minY + 12) break;
          page.drawText(line, {
            x: cardX + padding,
            y: contentY,
            size: 14,
            font: fontBold,
            color: rgb(0, 0, 0),
          });
          contentY -= 16;
        }
        contentY -= 10;

        // Add image if available
        if (location.image) {
          try {
            const imageResponse = await fetch(location.image);
            if (!imageResponse.ok) throw new Error('Image fetch failed');
            
            const contentType = imageResponse.headers.get('content-type') || '';
            const imageBytes = await imageResponse.arrayBuffer();
            
            let image;
            if (contentType.includes('jpeg') || contentType.includes('jpg')) {
              image = await pdfDoc.embedJpg(imageBytes);
            } else if (contentType.includes('png')) {
              image = await pdfDoc.embedPng(imageBytes);
            } else {
              continue;
            }
            
            // Scale image to fit card width
            const maxImageHeight = 100;
            const scale = Math.min(
              maxContentWidth / image.width,
              maxImageHeight / image.height
            );
            const imgWidth = image.width * scale;
            const imgHeight = image.height * scale;
            
            // Only add image if there's enough space
            if (contentY - imgHeight > minY + 50) {
              page.drawImage(image, {
                x: cardX + padding + (maxContentWidth - imgWidth) / 2,
                y: contentY - imgHeight,
                width: imgWidth,
                height: imgHeight,
              });
              contentY -= imgHeight + 10;
            }
          } catch (error) {
            console.error('Error processing image:', error);
          }
        }

        // Extended description - clean the text
        if (location.extended_description) {
          const truncatedDesc = truncateWords(location.extended_description, 75);
          const descLines = wrapText(truncatedDesc, fontRegular, 9, maxContentWidth);
          
          for (const line of descLines) {
            if (contentY < minY + 12) break;
            page.drawText(line, {
              x: cardX + padding,
              y: contentY,
              size: 9,
              font: fontRegular,
              color: rgb(0.2, 0.2, 0.2),
            });
            contentY -= 11;
          }
          contentY -= 5;
        }

        // Contact information - clean the text
        if (location.contact && contentY > minY + 12) {
          const cleanContact = cleanText(`Contacto: ${location.contact}`);
          const contactLines = wrapText(cleanContact, fontRegular, 9, maxContentWidth);
          for (const line of contactLines) {
            if (contentY < minY + 12) break;
            page.drawText(line, {
              x: cardX + padding,
              y: contentY,
              size: 9,
              font: fontRegular,
              color: rgb(0.3, 0.3, 0.3),
            });
            contentY -= 11;
          }
        }

        // Address - clean the text
        if (location.address && contentY > minY + 12) {
          const cleanAddress = cleanText(`Direccion: ${location.address}`);
          const addressLines = wrapText(cleanAddress, fontRegular, 9, maxContentWidth);
          for (const line of addressLines) {
            if (contentY < minY + 12) break;
            page.drawText(line, {
              x: cardX + padding,
              y: contentY,
              size: 9,
              font: fontRegular,
              color: rgb(0.3, 0.3, 0.3),
            });
            contentY -= 11;
          }
        }

        // Services - clean the text
        if (location.services && contentY > minY + 12) {
          const services = Array.isArray(location.services) 
            ? location.services.join(', ')
            : location.services;
          
          const cleanServices = cleanText(`Servicios: ${services}`);
          const serviceLines = wrapText(cleanServices, fontRegular, 9, maxContentWidth);
          for (const line of serviceLines) {
            if (contentY < minY + 12) break;
            page.drawText(line, {
              x: cardX + padding,
              y: contentY,
              size: 9,
              font: fontRegular,
              color: rgb(0.3, 0.3, 0.3),
            });
            contentY -= 11;
          }
        }
      }
      
      // Add footer to every page
      const footerY = 25;
      const footerText = 'INAVI | Tel: +598 1234 5678 | Email: info@inavi.uy | Web: www.inavi.uy';
      
      // Draw footer separator
      page.drawLine({
        start: { x: margin, y: footerY + 15 },
        end: { x: pageWidth - margin, y: footerY + 15 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      // Draw footer text
      page.drawText(footerText, {
        x: margin,
        y: footerY,
        size: 10,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    return await pdfDoc.save();
  };

  const uploadToDropbox = async (pdfBytes, fileName) => {
    try {
      // Sanitize filename
      const safeFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
      
      // Prepare upload metadata
      const metadata = {
        path: `/${safeFileName}`,
        mode: 'overwrite',
        autorename: true,
        mute: true
      };

      // Create request body
      const body = new Blob([pdfBytes], { type: 'application/octet-stream' });

      // Upload PDF to Dropbox
      const uploadResponse = await fetch(DROPBOX_UPLOAD_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify(metadata)
        },
        body
      });

      // Handle response
      if (!uploadResponse.ok) {
        let errorMessage = `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}`;
        
        try {
          const errorData = await uploadResponse.text();
          try {
            const jsonError = JSON.parse(errorData);
            errorMessage = jsonError.error_summary || jsonError.message || errorData;
          } catch {
            errorMessage = errorData;
          }
        } catch {
          // Couldn't extract error text
        }
        
        throw new Error(`Upload failed: ${errorMessage}`);
      }

      const uploadData = await uploadResponse.json();
      const filePath = uploadData.path_display;

      // Create shareable link
      const shareResponse = await fetch(DROPBOX_SHARE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: filePath,
          settings: {
            requested_visibility: 'public'
          }
        })
      });

      if (!shareResponse.ok) {
        const errorData = await shareResponse.text();
        throw new Error(`Sharing failed: ${errorData}`);
      }

      const shareData = await shareResponse.json();
      
      // Return direct download link
      return shareData.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                         .replace('?dl=0', '');
    } catch (error) {
      console.error('Full Dropbox error:', error);
      throw new Error(`Dropbox operation failed: ${error.message}`);
    }
  };

  const sendEmail = async (shareableLink) => {
    try {
      console.log('Sending email to:', email);
      console.log('Template params:', {
        to_email: email,
        link: shareableLink,
        message: 'Here is your personalized wine tour itinerary!',
        unsubscribe_link: 'https://your-website.com/unsubscribe'
      });

      // Prepare template parameters
      const templateParams = {
        to_email: email,
        link: shareableLink,
        message: 'Aqui esta tu itinerario personalizado de Enoturismo!',
        unsubscribe_link: 'https://your-website.com/unsubscribe'
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (response.status !== 200) {
        throw new Error(`Email failed with status ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('EmailJS error:', error);
      throw new Error('Failed to send email');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Porfavor ingrese un email valido');
      return;
    }

    setStatus('generating');
    setMessage('Creando su itinerario...');

    try {
      // Get favorites from cookies
      const rawFavorites = Cookies.get('favoritos');
      const favorites = rawFavorites ? JSON.parse(decodeURIComponent(rawFavorites)) : [];
      
      if (!favorites.length) {
        throw new Error('Please select at least one location');
      }

      // Prepare locations data
      const allLocations = Array.isArray(locations)
        ? locations
        : Object.values(locations).flat();

      const itineraryLocations = favorites.map((fav) => {
        const extendedLocation = allLocations.find(
          (loc) => loc.entity_index === fav.place_id
        );
        return {
          name: extendedLocation?.name || '',
          address: extendedLocation?.como_llegar?.join(', ') || '',
          services: extendedLocation?.servicios?.join(', ') || '',
          extended_description: extendedLocation?.extended_description || '',
          contact: extendedLocation?.datos_de_contacto?.join(', ') || '',
          image: extendedLocation?.images?.[0]?.src || '',
        };
      }).filter(loc => loc.name);

      if (!itineraryLocations.length) {
        throw new Error('No matching locations found');
      }

      console.log('Itinerary locations:', itineraryLocations);
      // Generate PDF
      const pdfBytes = await generatePdf(itineraryLocations);
      
      // Upload to Dropbox
      setStatus('uploading');
      setMessage('Subiendo a Dropbox...');
      
      const fileName = `enotourism-itinerary-${Date.now()}.pdf`;
      const shareableLink = await uploadToDropbox(pdfBytes, fileName);
      
      // Send email
      setStatus('sending');
      setMessage('Enviando email...');
      
      await sendEmail(shareableLink);
      
      // Success
      setStatus('success');
      setMessage('Itinerario enviado!');
      
      // Reset form after success
      setTimeout(() => {
        setEmail('');
        setStatus('idle');
        setMessage('');
      }, 5000);
      
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Fallo procesando el itinerario');
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-4 rounded-lg flex items-center flex-col -translate-y-5">
      <form ref={formRef} onSubmit={handleSubmit}>
        <input
          type="hidden"
          name="itinerary_link"
          value="Will be set in email template"
        />
        
        <div className="mb-4 w-[80vw]">
          <VirtualKeyboard onChange={handleKeyboardChange}/>
        </div>
        
        <button
          type="submit"
          disabled={status !== 'idle' && status !== 'error'}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {status === 'idle' && 'Enviar itinerario via email'}
          {status === 'generating' && 'Generando PDF...'}
          {status === 'uploading' && 'Subiendo a Dropbox...'}
          {status === 'sending' && 'Enviando email...'}
          {status === 'success' && 'Email enviado!'}
          {status === 'error' && 'Vuelve a intentar'}
        </button>
      </form>
      
      {message && (
        <p className={`mt-3 text-center ${
          status === 'success' ? 'text-green-500' : 
          status === 'error' ? 'text-red-500' : 'text-gray-700'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}