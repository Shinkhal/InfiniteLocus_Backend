import React, { useEffect, useMemo, useState } from 'react'
import './Admin.css'

const API_BASE = 'https://infinitelocus-backend-5r1w.onrender.com/api'

const initialForm = { id: '', name: '', code: '', description: '' }

const AdminPage = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)
  const [isSaving, setIsSaving] = useState(false)
  const [filter, setFilter] = useState('')

  const filteredCourses = useMemo(() => {
    if (!filter.trim()) return courses
    const q = filter.toLowerCase()
    return courses.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    )
  }, [filter, courses])

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/courses`)
      if (!res.ok) throw new Error('Failed to fetch courses')
      const data = await res.json()
      setCourses(data)
    } catch (e) {
      setError(e.message || 'Error loading courses')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const startCreate = () => {
    setForm(initialForm)
  }

  const startEdit = (course) => {
    setForm({ id: course._id, name: course.name || '', code: course.code || '', description: course.description || '' })
  }

  const handleDelete = async (courseId) => {
    if (!confirm('Delete this course?')) return
    try {
      setIsSaving(true)
      const res = await fetch(`${API_BASE}/courses/${courseId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete course')
      await loadCourses()
      if (form.id === courseId) setForm(initialForm)
    } catch (e) {
      alert(e.message || 'Delete failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) {
      alert('Name and Code are required')
      return
    }
    const payload = { name: form.name.trim(), code: form.code.trim(), description: form.description.trim() }
    try {
      setIsSaving(true)
      setError('')
      let res
      if (form.id) {
        res = await fetch(`${API_BASE}/courses/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(`${API_BASE}/courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
      if (!res.ok) throw new Error('Failed to save course')
      await loadCourses()
      setForm(initialForm)
    } catch (e) {
      alert(e.message || 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="admin">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-actions">
            <input
              className="search"
              placeholder="Search courses..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <button className="btn" onClick={loadCourses} disabled={loading}>Refresh</button>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="grid">
          <div className="panel panel-list">
            <h2>Courses {loading && <span className="muted">(loading...)</span>}</h2>
            <div className="course-list">
              {filteredCourses.length === 0 && !loading && (
                <div className="empty">No courses found.</div>
              )}
              {filteredCourses.map(course => (
                <div key={course._id} className="course-row">
                  <div className="course-main">
                    <div className="course-title">{course.name}</div>
                    <div className="course-meta">
                      <span className="code">{course.code}</span>
                      {typeof course.avgRating === 'number' && (
                        <span className="rating">Avg: {course.avgRating.toFixed(1)}</span>
                      )}
                      {typeof course.totalFeedback === 'number' && (
                        <span className="reviews">Reviews: {course.totalFeedback}</span>
                      )}
                    </div>
                    {course.description && (
                      <div className="course-desc">{course.description}</div>
                    )}
                  </div>
                  <div className="course-actions">
                    <button className="btn small" onClick={() => startEdit(course)}>Edit</button>
                    <button className="btn small danger" onClick={() => handleDelete(course._id)} disabled={isSaving}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel panel-form">
            <h2>{form.id ? 'Edit Course' : 'Add Course'}</h2>
            <form onSubmit={handleSubmit} className="course-form">
              <label>
                <span>Course Name</span>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g., MERN Stack" required />
              </label>
              <label>
                <span>Course Code</span>
                <input name="code" value={form.code} onChange={handleChange} placeholder="e.g., INT-100" required />
              </label>
              <label>
                <span>Description</span>
                <textarea name="description" rows={4} value={form.description} onChange={handleChange} placeholder="Short description (optional)" />
              </label>
              <div className="form-actions">
                {form.id && (
                  <button type="button" className="btn secondary" onClick={() => setForm(initialForm)}>Cancel</button>
                )}
                <button type="submit" className="btn primary" disabled={isSaving}>{isSaving ? 'Saving...' : (form.id ? 'Update Course' : 'Create Course')}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
