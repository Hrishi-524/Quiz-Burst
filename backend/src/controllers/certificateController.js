import PDFDocument from 'pdfkit';
import Game from '../models/Game.js';

export const generateCertificate = async (req, res) => {
    try {
        const { playerName, score, totalQuestions, gameCode, rank, date } = req.body;

        if (!playerName || score === undefined || !totalQuestions) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log('certificate is being generated');
        console.log(req.body);

        const game = await Game.find({gameCode:gameCode}).populate('quiz')
        console.log(game)
        
        const quizTitle = game[0].quiz.title
        // Create new PDF document (landscape Letter size for better compatibility)
        const doc = new PDFDocument({
            size: 'LETTER',
            layout: 'landscape',
            margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="quiz-certificate-${playerName.replace(/\s+/g, '-')}.pdf"`);

        // Pipe PDF to response
        doc.pipe(res);

        // Page dimensions (Letter landscape: 792x612)
        const pageWidth = 792;
        const pageHeight = 612;
        const centerX = pageWidth / 2;

        // === BACKGROUND ===
        doc.rect(0, 0, pageWidth, pageHeight)
           .fillColor('#0a0e27')
           .fill();

        doc.rect(0, 0, pageWidth, pageHeight / 2)
           .fillColor('#1e293b', 0.5)
           .fill();

        // === DECORATIVE BORDERS ===
        doc.rect(25, 25, pageWidth - 50, pageHeight - 50)
           .lineWidth(3)
           .strokeColor('#fbbf24')
           .stroke();

        doc.rect(35, 35, pageWidth - 70, pageHeight - 70)
           .lineWidth(1.5)
           .strokeColor('#3b82f6')
           .stroke();

        // === DECORATIVE CORNER ACCENTS ===
        const drawCornerAccent = (x, y, flipX = 1, flipY = 1) => {
            const size = 30;
            doc.moveTo(x, y)
               .lineTo(x + (size * flipX), y)
               .lineWidth(2.5)
               .strokeColor('#22d3ee')
               .stroke();
            doc.moveTo(x, y)
               .lineTo(x, y + (size * flipY))
               .lineWidth(2.5)
               .strokeColor('#22d3ee')
               .stroke();
        };

        drawCornerAccent(50, 50, 1, 1);
        drawCornerAccent(pageWidth - 50, 50, -1, 1);
        drawCornerAccent(50, pageHeight - 50, 1, -1);
        drawCornerAccent(pageWidth - 50, pageHeight - 50, -1, -1);

        // === DECORATIVE STAR ACCENTS ===
        const drawStar = (cx, cy, spikes, outerRadius, innerRadius) => {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;

            doc.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                doc.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                doc.lineTo(x, y);
                rot += step;
            }
            doc.lineTo(cx, cy - outerRadius);
            doc.closePath();
        };

        // Add subtle stars near corners
        doc.save();
        drawStar(80, 80, 5, 8, 4);
        doc.fillColor('#fbbf24', 0.3).fill();
        drawStar(pageWidth - 80, 80, 5, 8, 4);
        doc.fillColor('#fbbf24', 0.3).fill();
        drawStar(80, pageHeight - 80, 5, 8, 4);
        doc.fillColor('#fbbf24', 0.3).fill();
        drawStar(pageWidth - 80, pageHeight - 80, 5, 8, 4);
        doc.fillColor('#fbbf24', 0.3).fill();
        doc.restore();

        // === HEADER SECTION ===
        let currentY = 80;

        // Main title - CERTIFICATE
        doc.fontSize(48)
           .fillColor('#ffffff')
           .font('Helvetica-Bold')
           .text('CERTIFICATE', 0, currentY, { 
               width: pageWidth, 
               align: 'center'
           });

        currentY += 60;

        // Subtitle - OF ACHIEVEMENT
        doc.fontSize(22)
           .fillColor('#fbbf24')
           .font('Helvetica')
           .text('OF ACHIEVEMENT', 0, currentY, { 
               width: pageWidth, 
               align: 'center'
           });

        currentY += 40;

        // Top decorative line
        doc.moveTo(centerX - 120, currentY)
           .lineTo(centerX + 120, currentY)
           .lineWidth(2)
           .strokeColor('#3b82f6')
           .stroke();

        // === BODY SECTION ===
        currentY += 30;

        // "Presented to" text
        doc.fontSize(13)
           .fillColor('#cbd5e1')
           .font('Helvetica')
           .text('This certificate is proudly presented to', 0, currentY, { 
               width: pageWidth, 
               align: 'center'
           });

        currentY += 25;

        // Recipient name
        doc.fontSize(36)
           .fillColor('#22d3ee')
           .font('Helvetica-Bold')
           .text(playerName, 0, currentY, { 
               width: pageWidth, 
               align: 'center'
           });

        currentY += 45;

        // Name underline
        doc.moveTo(centerX - 180, currentY)
           .lineTo(centerX + 180, currentY)
           .lineWidth(1)
           .strokeColor('#60a5fa')
           .stroke();

        currentY += 22;

        // "for successfully completing" text
        doc.fontSize(13)
           .fillColor('#e2e8f0')
           .font('Helvetica')
           .text('for successfully completing the quiz', 0, currentY, { 
               width: pageWidth, 
               align: 'center'
           });

        currentY += 25;

        // Quiz title
        doc.fontSize(18)
           .fillColor('#ffffff')
           .font('Helvetica-Bold')
           .text(`"${quizTitle}"`, 0, currentY, { 
               width: pageWidth, 
               align: 'center'
           });

        currentY += 45;

        // === STATS SECTION ===
        const boxWidth = 150;
        const boxHeight = 60;
        const gap = 40;
        
        const scoreBoxX = centerX - boxWidth - gap / 2;
        const rankBoxX = centerX + gap / 2;

        // Score box
        doc.roundedRect(scoreBoxX, currentY, boxWidth, boxHeight, 8)
           .fillColor('#1e3a8a', 0.4)
           .fill()
           .strokeColor('#3b82f6')
           .lineWidth(1)
           .stroke();

        // Rank box
        doc.roundedRect(rankBoxX, currentY, boxWidth, boxHeight, 8)
           .fillColor('#1e3a8a', 0.4)
           .fill()
           .strokeColor('#3b82f6')
           .lineWidth(1)
           .stroke();

        // Score label
        doc.fontSize(11)
           .fillColor('#cbd5e1')
           .font('Helvetica')
           .text('SCORE', scoreBoxX, currentY + 14, { 
               width: boxWidth, 
               align: 'center'
           });

        doc.fontSize(20)
           .fillColor('#22d3ee')
           .font('Helvetica-Bold')
           .text(`${score} `, scoreBoxX, currentY + 32, { 
               width: boxWidth, 
               align: 'center'
           });

        // Rank label
        doc.fontSize(11)
           .fillColor('#cbd5e1')
           .font('Helvetica')
           .text('RANK', rankBoxX, currentY + 14, { 
               width: boxWidth, 
               align: 'center'
           });

        doc.fontSize(20)
           .fillColor('#fbbf24')
           .font('Helvetica-Bold')
           .text(`#${rank || 'N/A'}`, rankBoxX, currentY + 32, { 
               width: boxWidth, 
               align: 'center'
           });

        // === FOOTER SECTION ===
        currentY = pageHeight - 85;

        // Bottom decorative line
        doc.moveTo(centerX - 120, currentY)
           .lineTo(centerX + 120, currentY)
           .lineWidth(2)
           .strokeColor('#3b82f6')
           .stroke();

        currentY += 18;

        // Date
        doc.fontSize(11)
           .fillColor('#94a3b8')
           .font('Helvetica')
           .text(`Completed on ${date || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`, 0, currentY, { 
               width: pageWidth, 
               align: 'center'
           });

        currentY += 20;

        // Platform name
        doc.fontSize(10)
           .fillColor('#64748b')
           .font('Helvetica-Bold')
           .text('QuizBurst - Interactive Quiz Platform', 0, currentY, { 
               width: pageWidth, 
               align: 'center'
           });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('Certificate generation error:', error);
        res.status(500).json({ error: 'Failed to generate certificate' });
    }
};