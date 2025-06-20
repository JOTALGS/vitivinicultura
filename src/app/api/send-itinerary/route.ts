import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Resend } from 'resend';

// Environment variables (add to .env.local)
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com';
const FROM_NAME = process.env.FROM_NAME || 'Enotourism Planner';

export async function POST(request: Request) {
  try {
    const { locations, email } = await request.json();

    // Validate input
    if (!locations?.length || !email) {
      return NextResponse.json(
        { error: 'Locations and email are required' },
        { status: 400 }
      );
    }

    // 1. Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 12;
    const margin = 50;
    let y = height - margin;

    // Add title
    page.drawText('Your Enotourism Itinerary', {
      x: margin,
      y,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    // Add locations
    locations.forEach((location: any, index: number) => {
      if (y < margin) {
        pdfDoc.addPage();
        y = height - margin;
      }
      
      page.drawText(`${index + 1}. ${location.name}`, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= fontSize + 5;

      // Add other fields (address, contact, etc.)
      const fields = [
        `Address: ${location.address}`,
        `Contact: ${location.contact}`,
        `Services: ${location.services}`,
      ];

      fields.forEach(field => {
        if (y < margin) {
          pdfDoc.addPage();
          y = height - margin;
        }
        page.drawText(field, {
          x: margin + 15,
          y,
          size: fontSize - 2,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= fontSize + 2;
      });
      
      y -= 20; // Space between locations
    });

    const pdfBytes = await pdfDoc.save();


    // 2. Send email
    const resend = new Resend(process.env.RESEND_API_KEY);
  
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: 'Your Enotourism Itinerary',
      html: `<p>Your personalized itinerary is attached.</p>`,
      attachments: [{
        filename: 'itinerary.pdf',
        content: Buffer.from(pdfBytes)
      }]
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}