const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const AdminAccessRequest = require('../models/AdminAccessRequest')
const Admin = require('../models/Admin')
const { sendApprovalEmail } = require('../utils/emailTransporter')

// POST /api/admin/request-access
exports.requestAccess = async (req, res) => {
  try {
    const { full_name, email, designation, state, district } = req.body

    // Basic Validation
    if (!full_name || !email || !designation || !state || !district) {
      return res.status(400).json({ error: 'Sabhi fields zaroori hain (All fields are required).' })
    }

    const trimmedEmail = email.trim().toLowerCase()
    const emailParts = trimmedEmail.split('@')
    const domain = emailParts[1]

    // Check if domain is gov.in or ends with .gov.in
    if (!domain || (domain !== 'gov.in' && !domain.endsWith('.gov.in'))) {
      return res.status(400).json({ 
        error: 'Keval official .gov.in email allowed hai (Only official .gov.in emails are allowed).' 
      })
    }

    // Check if duplicate request exists
    const existingRequest = await AdminAccessRequest.findOne({ email: trimmedEmail })
    if (existingRequest) {
      return res.status(400).json({ 
        error: `Email ${trimmedEmail} ke liye access request pehle se registered hai.` 
      })
    }

    // Check if an admin account already exists with this email
    const existingAdmin = await Admin.findOne({ email: trimmedEmail })
    if (existingAdmin) {
      return res.status(400).json({
        error: `Email ${trimmedEmail} ke liye admin account pehle se bana hua hai.`
      })
    }

    const newRequest = await AdminAccessRequest.create({
      full_name: full_name.trim(),
      email: trimmedEmail,
      designation: designation.trim(),
      state: state.trim(),
      district: district.trim(),
      status: 'pending'
    })

    res.status(201).json({ 
      message: 'Access request successfully registered. Pending review.',
      request: newRequest
    })
  } catch (err) {
    console.error('requestAccess error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/admin/access-requests (Superadmin only)
exports.getAccessRequests = async (req, res) => {
  try {
    const query = {}
    if (req.query.status) {
      query.status = req.query.status
    }

    const requests = await AdminAccessRequest.find(query)
      .populate('reviewed_by', 'name email')
      .sort({ requested_at: -1 })

    res.json(requests)
  } catch (err) {
    console.error('getAccessRequests error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// PATCH /api/admin/access-requests/:id/approve (Superadmin only)
exports.approveAccessRequest = async (req, res) => {
  try {
    const { role } = req.body
    const { id } = req.params

    if (!role || !['state_admin', 'district_admin'].includes(role)) {
      return res.status(400).json({ 
        error: 'Sahi role chunna zaroori hai (Valid role state_admin or district_admin is required).' 
      })
    }

    const request = await AdminAccessRequest.findById(id)
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        error: `Request already processed. Current status is ${request.status}.` 
      })
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: request.email })
    if (existingAdmin) {
      // Just mark request as approved to keep state consistent
      request.status = 'approved'
      request.reviewed_at = new Date()
      request.reviewed_by = req.admin._id
      await request.save()

      return res.status(400).json({ 
        error: 'Admin account with this email already exists.' 
      })
    }

    // Auto-generate a secure temporary password
    const tempPassword = crypto.randomBytes(6).toString('hex') // 12-char hex string
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create the new Admin entry
    const newAdmin = await Admin.create({
      email: request.email,
      password: hashedPassword,
      name: request.full_name,
      role,
      state: request.state,
      district: role === 'district_admin' ? request.district : null,
      isActive: true,
      must_change_password: true
    })

    // Send credentials email
    const emailSent = await sendApprovalEmail(request.email, tempPassword, request.full_name, role)
    if (!emailSent) {
      console.warn(`[Warning] Access Request approved, but credentials email to ${request.email} failed to send.`)
    }

    // Update access request status
    request.status = 'approved'
    request.reviewed_at = new Date()
    request.reviewed_by = req.admin._id
    await request.save()

    res.json({
      message: 'Access request approved successfully. Officer credentials created and emailed.',
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role
      }
    })
  } catch (err) {
    console.error('approveAccessRequest error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// PATCH /api/admin/access-requests/:id/reject (Superadmin only)
exports.rejectAccessRequest = async (req, res) => {
  try {
    const { reason } = req.body
    const { id } = req.params

    const request = await AdminAccessRequest.findById(id)
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        error: `Request already processed. Current status is ${request.status}.` 
      })
    }

    request.status = 'rejected'
    request.reason = reason ? reason.trim() : undefined
    request.reviewed_at = new Date()
    request.reviewed_by = req.admin._id
    await request.save()

    res.json({
      message: 'Access request rejected successfully.',
      request
    })
  } catch (err) {
    console.error('rejectAccessRequest error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
