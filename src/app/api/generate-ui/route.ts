import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Run the Python agent script
    const pythonPath = path.join(process.cwd(), '.venv', 'Scripts', 'python.exe')
    const scriptPath = path.join(process.cwd(), 'agent_ui_generator.py')

    return new Promise((resolve) => {
      const pythonProcess = spawn(pythonPath, [scriptPath, prompt], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONPATH: process.cwd() }
      })

      let output = ''
      let errorOutput = ''

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(NextResponse.json({ code: output.trim() }))
        } else {
          resolve(NextResponse.json({ error: errorOutput || 'Failed to generate UI' }, { status: 500 }))
        }
      })

      pythonProcess.on('error', (error) => {
        resolve(NextResponse.json({ error: error.message }, { status: 500 }))
      })

      // Send the prompt to stdin
      pythonProcess.stdin.write(prompt)
      pythonProcess.stdin.end()
    })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}