import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the base64 encoded credentials from environment variable
    const credentials = process.env.CAMARA_API_CREDENTIALS

    if (!credentials) {
      throw new Error("CAMARA API credentials not found")
    }

    // Make request to get token
    const response = await fetch("https://api.orange.com/oauth/v3/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })

    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({ token: data.access_token })
  } catch (error) {
    console.error("Error getting auth token:", error)
    return NextResponse.json({ error: "Failed to get auth token" }, { status: 500 })
  }
}
