import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const { query, variables } = await request.json()

  const res = await fetch("https://api.stratz.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.STRATZ_API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  })

  const body = await res.text()
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  })
}
