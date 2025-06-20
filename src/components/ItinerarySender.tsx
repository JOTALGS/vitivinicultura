import { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Cookies from 'js-cookie';
import emailjs from '@emailjs/browser';

type Location = {
  address: string;
  contact: string;
  coordinates: number[];
  extended_description: string;
  name: string;
  services: string;
  image: string;
};

// Dropbox API endpoints
const DROPBOX_UPLOAD_URL = 'https://content.dropboxapi.com/2/files/upload';
const DROPBOX_SHARE_URL = 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings';
const DROPBOX_ACCESS_TOKEN = 'sl.u.AFwy1XGSpoGRGcpAZcmmNJ9x8XnaRpaNprzSIoecxdGDcOWGll3UlAWguXFnd_O-sFF7QmNmiTKKoDLbpL4U-zZ8ZF6eHRTrAm1NEUNfZMkKdLAmlAQF0dKruy3qeAvv_50seXR2v2TmXLXR-L9KJlYQlP8aiWPuFR1j0RVjGz5lcATLveNsA9_aKTA83rao6iu7uFyGANtxc4TG1SkgktDxm4_AcaWzj6s7-7gR8wdlwg1bqGMwZNGUNasjLY_ksaFfzSfkkvIlLx4IIVFVszICe6AwQadS_AAPMo7d5UVs-_36GcyIAewSviA7nnaGp4xOA59imEhRUfGuUyABWMfjEEOp686JLRFq4nHhJpFvR4xuobaadqyLYD3GxlZrBmUtBJNzKtDi5-nJkMlYCpfy2jWyNq8-BMYNuIqrWMGjkNcc1y9EzCI6Hunj3rs_-AH1E4P808kJMSnalH_zc5SXysGxKEhanqWnMfyYC5WDjBT6J3bnFJ55KSPJxQ9Y-Z46q2-jCQcey96gtvUBuH0SLq0SzWWzMikJUiepDdl58AoiW_OcRUxWpuK4DoKB9gh2x2UAWdaeHRvXFlYFEwXN1EtaNTe_AzMWlkrrMZpqb4Je6rmlWb176XBWZgYJiumitmogt9O8fwk83AZ4UfYWNP3Kgz8iJPFJx1hNQ_GTpNMSpHhGpDxnynd3In5BxHh9mhhbXRmGtoaKn1ikXfR_t4a_ssbOoxKw7hTiOcnidSLrvfN58UU-smf8b4eZPlSofLZVqbQgyxp52YhrfncRzBMbBLBh3gqHOBOJv6zwh2CUn2lhvKUskvi651S9lViqoba40cY_1NONHU8iEeVSBfMqcfcfJ7H-wkW-XJHLQiBF_GA_YSRywZwLoEMCJ7jjLbojl0PDAgx7jJ-YV_oUMZWtzhT7Svfgn_Q5IRJRPKanyoR6Sf60mngy2fCs_DOHkqy0eLjBjeqWSc_AK-Zb9zshKZm1Iz9N_QJs6ZSXhsggtNOzqrsLYdtLpuwkOvPnjStRdvVBYduMqT0ojalsz0Ma-TUgbD8FQocY8c7PgQ2RE1dIeqEUO3ilHwzOrRlSnUXYOUFK-Q6Doz-8Wz2KX2N4TAsJ97Xp-fIZVdzBUGZwL_AzRfoYES4DSgWpnX5Nv4T9WCcIR-daJEVFtuJjbUddaRFaeDN15TOD8tcnvJ-iEV2e7riaglkh3yemHq9-KUq_S5jSrsN3C492uYKbfqqObUWdXE4YdTsi3RXkXfymR0cI7lFV1nvUd-aGYJwwnpnErgWaQEKzPJWNgIZYaRGiLhca7OLmy1nvABNGazA6RJUgSyZdTz5AwrqQ_mf4KaFLSJF7WOoWgdMybYF_Ug6Lgl0mhbKGx-SbXl56qukGxjL_8_Yr1Dh7CKoczHpvnLf0mYhxYPLkgdnsb0MqrZ7BEGtGaeGhIlJeHlx8hw';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_lzdx8mk';
const EMAILJS_TEMPLATE_ID = 'template_6vqzqcd';
const EMAILJS_PUBLIC_KEY = 'LSsVMkGBfBQzbA1qv';

export default function ItinerarySender({ locations }: { locations: Location[] }) {
  const [status, setStatus] = useState<'idle' | 'generating' | 'uploading' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const formRef = useRef<HTMLFormElement>(null);


const generatePdf = async (locations: Location[]) => {
  console.log('Generating PDF for locations:', locations); // Added logging
  
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
  const padding = 10; // Inner padding for cards
  const maxContentWidth = cardWidth - 2 * padding; // Max width for text content
  
  // Helper to truncate text
  const truncateWords = (text: string, maxWords: number) => {
    const words = text.split(/\s+/);
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
  };

  // Helper to wrap text to fit within maxWidth
  const wrapText = (text: string, font: any, fontSize: number, maxWidth: number) => {
    const lines = [];
    let currentLine = '';

    const words = text.split(/\s+/);
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

  // Split locations into chunks of 4 (for 2x2 grid per page)
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
      const minY = cardY + padding; // Minimum Y position for content
      
      // Location name/number
      const nameLines = wrapText(`${location.name}`, fontBold, 14, maxContentWidth);
      for (const line of nameLines) {
        if (contentY < minY + 12) break; // Prevent overflow
        page.drawText(line, {
          x: cardX + padding,
          y: contentY,
          size: 14,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
        contentY -= 16; // Line height
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

      // Extended description (truncated to 75 words)
      if (location.extended_description) {
        const truncatedDesc = truncateWords(location.extended_description, 75);
        const descLines = wrapText(truncatedDesc, fontRegular, 9, maxContentWidth);
        
        for (const line of descLines) {
          if (contentY < minY + 12) break; // Prevent overflow
          page.drawText(line, {
            x: cardX + padding,
            y: contentY,
            size: 9,
            font: fontRegular,
            color: rgb(0.2, 0.2, 0.2),
          });
          contentY -= 11; // Line height
        }
        contentY -= 5;
      }

      // Contact information
      if (location.contact && contentY > minY + 12) {
        const contactLines = wrapText(`Contacto: ${location.contact}`, fontRegular, 9, maxContentWidth);
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

      // Address
      if (location.address && contentY > minY + 12) {
        const addressLines = wrapText(`Dirección: ${location.address}`, fontRegular, 9, maxContentWidth);
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

      // Services
      if (location.services && contentY > minY + 12) {
        const services = Array.isArray(location.services) 
          ? location.services.join(', ')
          : location.services;
          
        const serviceLines = wrapText(`Servicios: ${services}`, fontRegular, 9, maxContentWidth);
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


const uploadToDropbox = async (pdfBytes: Uint8Array, fileName: string): Promise<string> => {
  try {
    // 1. Sanitize filename
    const safeFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    
    // 2. Prepare upload metadata
    const metadata = {
      path: `/${safeFileName}`,
      mode: 'overwrite',
      autorename: true,
      mute: true
    };

    // 3. Create request body
    const body = new Blob([pdfBytes], { type: 'application/octet-stream' });

    // 4. Upload PDF to Dropbox
    const uploadResponse = await fetch(DROPBOX_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify(metadata)
      },
      body
    });

    // 5. Handle response (with better error parsing)
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

    // 6. Create shareable link
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
  } catch (error: any) {
    console.error('Full Dropbox error:', error);
    throw new Error(`Dropbox operation failed: ${error.message}`);
  }
};

const sendEmail = async (shareableLink: string) => {
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
      to_email: email,  // Recipient email from state
      link: shareableLink,
      message: 'Aqui esta tu itinerario personalizado de Enoturismo!',
      unsubscribe_link: 'https://your-website.com/unsubscribe' // Add unsubscribe link
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage('Porfavor ingrese un email válido');
      return;
    }

    setStatus('generating');
    setMessage('Creando su itinerario...');

    try {
      // 1. Get favorites from cookies
      const rawFavorites = Cookies.get('favoritos');
      const favorites = rawFavorites ? JSON.parse(decodeURIComponent(rawFavorites)) : [];
      
      if (!favorites.length) {
        throw new Error('Please select at least one location');
      }

      // 2. Prepare locations data
      const allLocations = Array.isArray(locations)
        ? locations
        : Object.values(locations).flat();

      const itineraryLocations = favorites.map((fav: any) => {
        const extendedLocation = allLocations.find(
          (loc: any) => loc.entity_index === fav.place_id
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
      // 3. Generate PDF
      const pdfBytes = await generatePdf(itineraryLocations);
      
      // 4. Upload to Dropbox
      setStatus('uploading');
      setMessage('Subiendo a Dropbox...');
      
      const fileName = `enotourism-itinerary-${Date.now()}.pdf`;
      const shareableLink = await uploadToDropbox(pdfBytes, fileName);
      
      // 5. Send email
      setStatus('sending');
      setMessage('Enviando email...');
      
      await sendEmail(shareableLink);
      
      // 6. Success
      setStatus('success');
      setMessage('Itinerario enviado!');
      
      // Reset form after success
      setTimeout(() => {
        setEmail('');
        setStatus('idle');
        setMessage('');
      }, 5000);
      
    } catch (error: any) {
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