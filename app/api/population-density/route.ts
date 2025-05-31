import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      throw new Error("Authorization header missing")
    }

    // Make request to CAMARA API
    const response = await fetch("https://api.orange.com/camara/orange-lab/population-density-data/v0.1/retrieve", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}, ${await response.text()}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching population density:", error)
    return NextResponse.json({ error: "Failed to fetch population density data" }, { status: 500 })
  }
}
