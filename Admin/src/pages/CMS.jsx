import React, { useEffect, useState } from "react"
import DataTable from "../components/DataTable.jsx"
import { API_BASE_URL } from '../../../src/config/api.js';

export default function CMS() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    async function fetchPages() {
      try {
        const user = "jeel150"
        const repo = "cake"
        const branch = "main"

        const res = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/src/pages?ref=${branch}`)
        const files = await res.json()

        const commitRes = await fetch(`https://api.github.com/repos/${user}/${repo}/commits?path=src/pages&per_page=100`)
        const commits = await commitRes.json()

        const pageData = files
          .filter(f => f.name.endsWith(".jsx"))
          .map((file, index) => {
            const commit = commits[0] // simplified, you can match exact if needed

            return {
              id: index + 1,
              title: file.name.replace(".jsx", ""),
              slug: "/" + file.name.replace(".jsx", "").toLowerCase(),
              filename: file.name,
              updatedAt: commit?.commit?.author?.date || "N/A",
              updatedBy: commit?.commit?.author?.name || "Unknown",
            }
          })

        setRows(pageData)
      } catch (err) {
        console.error("GitHub fetch failed:", err)
      }
    }

    fetchPages()
  }, [])

  // ✅ Delete function
  const onDelete = async (filename) => {
    if (!window.confirm("⚠️ This will permanently delete the file from your project. Continue?")) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/pages/${filename}`, { method: "DELETE" })
      const data = await res.json()

      if (data.success) {
        setRows(rs => rs.filter(r => r.filename !== filename))
        alert("Page deleted successfully!")
      } else {
        alert("Delete failed: " + data.message)
      }
    } catch (err) {
      console.error("Error deleting page:", err)
      alert("Delete failed")
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Content Management</h3>
      </div>

      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "title", label: "Title" },
          { key: "slug", label: "Slug" },
          { key: "updatedAt", label: "Updated", render: v => new Date(v).toLocaleString() },
          { key: "updatedBy", label: "Updated By" },
          {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn ghost">Edit</button>
                <button className="btn ghost" onClick={() => onDelete(row.filename)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            )
          }
        ]}
        data={rows}
      />
    </div>
  )
}
