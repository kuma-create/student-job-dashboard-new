"use client"

import Link from "next/link"
import { Briefcase } from "lucide-react"

interface Job {
  id: string
  title: string
  description: string
  is_active: boolean
}

export default function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">求人一覧</h2>
      {jobs.length === 0 ? (
        <p className="text-gray-600">まだ求人が登録されていません。</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id} className="border rounded-lg p-4 hover:shadow-sm transition">
              <Link href={`/company/jobs/${job.id}`} className="block">
                <h3 className="text-lg font-semibold text-red-600 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  ステータス: {job.is_active ? "公開中" : "非公開"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
