import {GoogleGenerativeAI} from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req:NextRequest){
    try{
        const genAI =  new GoogleGenerativeAI(process.env.GEMINI_API||"")
        const model = genAI.getGenerativeModel({model:"gemini-pro"})
        const data = await req.json()

        const prompt = data.body
        
        const result = await model.generateContent(prompt)
        const response = await result.response
        const output = await response.text()
        return NextResponse.json({output:output})
    } catch(error) {
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log(String(error));
        }
        
    }
}