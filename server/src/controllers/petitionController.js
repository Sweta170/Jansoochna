const PDFDocument = require('pdfkit')
const cloudinary = require('../config/cloudinary')
const Issue = require('../models/Issue')
const Vote = require('../models/Vote')
const User = require('../models/User')
const axios = require('axios')
const { getPincodeName } = require('../utils/pincodeMap')
const { petitionQueue } = require('../config/redis')

// Generate petition PDF for an issue
async function generatePetitionForIssue(issueId) {
  const issue = await Issue.findById(issueId).populate('author', 'name phone email')
  if (!issue) throw new Error('Issue not found')

  // Get voters
  const votes = await Vote.find({ issue: issueId }).populate('user', 'name phone email')

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `जन शिकायत पत्र - ${issue.title}`,
          Author: 'JanSoochna',
        }
      })

      const chunks = []
      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks)

        // Upload to Cloudinary
        try {
          const result = await new Promise((res, rej) => {
            cloudinary.uploader.upload_stream(
              {
                folder: 'jansoochna/petitions',
                resource_type: 'raw',
                public_id: `petition-${issueId}`,
                format: 'pdf',
              },
              (err, result) => err ? rej(err) : res(result)
            ).end(pdfBuffer)
          })

          // Update issue with petition URL
          await Issue.findByIdAndUpdate(issueId, { petitionUrl: result.secure_url })
          resolve(result.secure_url)
        } catch (uploadErr) {
          console.error('Petition upload error:', uploadErr)
          reject(uploadErr)
        }
      })

      // ===== Build PDF =====

      // Header
      doc.fontSize(22).font('Helvetica-Bold')
         .text('Jan Shikayat Patra', { align: 'center' })

      doc.fontSize(11).font('Helvetica')
         .text('JanSoochna — Nagarik Awaaz', { align: 'center' })

      doc.moveDown(0.5)
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#1D9E75')
      doc.moveDown(1)

      // Date
      const date = new Date().toLocaleDateString('hi-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
      doc.fontSize(10).text(`Date: ${date}`, { align: 'right' })
      doc.moveDown(0.5)

      // Issue details
      doc.fontSize(14).font('Helvetica-Bold')
         .text('Shikayat ka Vivaran:', { underline: true })
      doc.moveDown(0.5)

      doc.fontSize(11).font('Helvetica-Bold').text('Title: ', { continued: true })
      doc.font('Helvetica').text(issue.title)
      doc.moveDown(0.3)

      doc.font('Helvetica-Bold').text('Category: ', { continued: true })
      doc.font('Helvetica').text(issue.category.toUpperCase())
      doc.moveDown(0.3)

      doc.font('Helvetica-Bold').text('Status: ', { continued: true })
      doc.font('Helvetica').text(issue.status)
      doc.moveDown(0.3)

      doc.font('Helvetica-Bold').text('Location: ', { continued: true })
      doc.font('Helvetica').text(
        `${issue.location.address || ''} (${getPincodeName(issue.location.pincode)}, ${issue.location.pincode})`
      )
      doc.moveDown(0.3)

      doc.font('Helvetica-Bold').text('Report Date: ', { continued: true })
      doc.font('Helvetica').text(
        new Date(issue.createdAt).toLocaleDateString('hi-IN', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
      )
      doc.moveDown(0.5)

      doc.font('Helvetica-Bold').text('Description:')
      doc.moveDown(0.3)
      doc.font('Helvetica').text(issue.description, { align: 'justify' })
      doc.moveDown(1)

      // Photo (if exists)
      if (issue.photoUrl) {
        try {
          const imgResponse = await axios.get(issue.photoUrl, { responseType: 'arraybuffer' })
          doc.image(imgResponse.data, { fit: [300, 200], align: 'center' })
          doc.moveDown(1)
        } catch (imgErr) {
          // Skip photo if can't fetch
        }
      }

      // Voter summary
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#1D9E75')
      doc.moveDown(0.5)

      doc.fontSize(14).font('Helvetica-Bold')
         .text(`${issue.voteCount} Nagarik is samasya se pareshan hain`)
      doc.moveDown(0.5)

      // Voter list (anonymised)
      doc.fontSize(10).font('Helvetica-Bold')
         .text('Samarthak Nagarikon ki Soochi:', { underline: true })
      doc.moveDown(0.3)

      votes.forEach((vote, i) => {
        const name = vote.user?.name || 'Nagarik'
        let contactMasked = '••••••••••'
        if (vote.user?.email) {
          const parts = vote.user.email.split('@')
          if (parts.length === 2) {
            contactMasked = `${parts[0].charAt(0)}••••@${parts[1]}`
          }
        } else if (vote.user?.phone) {
          contactMasked = `••••••${vote.user.phone.slice(-4)}`
        }
        doc.font('Helvetica').fontSize(9)
           .text(`${i + 1}. ${name} (${contactMasked})`)
      })

      doc.moveDown(1)

      // Footer
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#1D9E75')
      doc.moveDown(0.5)

      doc.fontSize(9).font('Helvetica')
         .text('Yeh petition JanSoochna app ke maadhyam se nagarikon dwara automatically generate hua hai.', { align: 'center' })
      doc.text('Website: https://jansoochna.in', { align: 'center' })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

// GET /api/petition/:issueId
exports.getPetition = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId)
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' })
    }

    if (issue.petitionUrl) {
      return res.json({ petitionUrl: issue.petitionUrl })
    }

    if (issue.voteCount < 50) {
      return res.status(400).json({
        error: `Petition ke liye 50 votes chahiye. Abhi ${issue.voteCount} votes hain.`
      })
    }

    // Queue petition generation instead of waiting synchronously
    await petitionQueue.add({ issueId: issue._id })
    res.json({ message: 'Petition generation started. You will be notified when it is ready.' })
  } catch (err) {
    console.error('getPetition error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

exports.generatePetitionForIssue = generatePetitionForIssue
