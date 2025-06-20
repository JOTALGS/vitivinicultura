import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Cookies from 'js-cookie';
import emailjs from '@emailjs/browser';

// Dropbox API endpoints
const DROPBOX_UPLOAD_URL = 'https://content.dropboxapi.com/2/files/upload';
const DROPBOX_SHARE_URL = 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings';
const DROPBOX_ACCESS_TOKEN = 'sl.u.AFw9-YYMQQCvMOaML1Oh6vfh1HHxsIcD84kJa9G1AX5h2krh0MdvoJ6cJJf4njy225I1577vtY8L80_-UkRNmjn-yvZ2IqaUPC68T6g16-CS_YmAFHNN0aY64nVBC4ZjswQiknIw1L2x9UrWbDdFYry8Og8SYbrZGcCwxuTIfDGmrjevpyniRqmHg6LLSWrQ-XnUz6Tqzf9KmZiaOhB4gadhTv3lVuzlSbudozDij_oxhkKBzt7gN6y5f2_BYH4uxf811jDjbfQasnZLkoZLbCIcMPhy98Vj6Um8FgbXGTLoQhetvi3ZNDBRT7yqi44iV8fJCK5A2HhITIa7l8cZtp085O95DXK6VLTU13-h4WdcWgk5CsNXdh6DbQST-2oLOrn4IsBFhil75ymdP8ytDPyt3fvQo2Sgleon15aNxQNtmg4Ixp4Z2JE8P1esjND3xvBz-D6Fln8J6dpevGFjdPqqiaIf7sa7aL2lgLWUzfvh53kHFZIozP4tBi7vcOewc4DzgC134-8Q1XR52pcLyivqN7Xag2b3CiEOWD1yCJIOrky77XEFYkGh_eZ2mmp7lkzExlTsO4YoxfSLmNyVo-tI0zyPg--znDUY6XC_6QuFS0t1gXFSJwApGeG6PLgzqc5p1uFDXygwPUBAV2UBsasq-4U5mcAQ790qbuqtb4QbxAqCDDKLjXXGlVw8sAX11XSCLX3KiQaK-enoDnNZk7akgTCsLbQBN6uMTtt14pyPtrrtovZycPI8ui5Pbxu8ROkLVoeWxIsV0VtgQAQBIxjdM3fwjCJB4BJ7jCJXGN3t05UoyZF-3hdTxYX2QOQUY1ngOGO-Nz6NU6x50LqWKPw43Bq-IhFK_YejqWbJOpnB8Y1mj1RuuxvNVX6iy20w7dFt6RU82LgqUxrqr6thO5NsDI4d1-KPxfzeSVLvkWLw3nUmBsjtyni62iMW6SfGaaankxVcP8ZF5mbghd8QjrT2-hHmNTI8gvrMUc5QONZt95iqlSV2VQ8TV5zQnfb7RchcRbmi0HMlmcrNwxVN6FQ5SlXCQ9Rs7yLpYeM22xRPWekmC0Rux8TQnNzdAaiydLD3WBalL9xJG5yrdL53a_NlRWoIM9wVrkn0yw3h9PWSL3rvY1ztQ8lL-4i7TBApEnC9K4EHsxnjTbDTTG27__NrUVoK_OHL0kMboeCrohuXepAOKwToKr57REVtNKTToeKAt-e5LGI3S9kIR2HY2vs4ddfhpdJD071dZA7TzF0wtJf3DV_WuvA9uifknzB12J_RfjYGFoqLARLPLhkhP9LLmJZS3Sgwd_jb1Qd8kOdtW200gu0jXDMRKl1ImppEScTRIW06AYaigBFkgckCCjlv01UsZVXv7Ly6oXWF-PXnsDwoyWOSkr0VflZQE3p5ImV25Rv9GPxQMs9ZJaXlk4znb6tO8IpI5TmeBxbi3GQkIA';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_lzdx8mk';
const EMAILJS_TEMPLATE_ID = 'template_6vqzqcd';
const EMAILJS_PUBLIC_KEY = 'LSsVMkGBfBQzbA1qv';

export default function ItinerarySender({ locations }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const formRef = useRef();

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
    <div className="p-4 rounded-lg max-w-md mx-auto -translate-y-5">
      <form ref={formRef} onSubmit={handleSubmit}>
        <input
          type="hidden"
          name="itinerary_link"
          value="Will be set in email template"
        />
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-300 text-xl font-medium mb-1">
            Ingrese su email
          </label>
          <input
            type="email"
            id="email"
            name="user_email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 border-b border-gray-300 text-gray-300 
                        focus:outline-none focus:border-b-2 focus:border-[#F2E6CE]"
            required
            disabled={status !== 'idle' && status !== 'error'}
          />
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