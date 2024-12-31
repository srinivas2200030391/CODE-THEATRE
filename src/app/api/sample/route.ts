import {NextRequest, NextResponse } from "next/server";


export async function GET(request:NextRequest,response:NextResponse):Promise<unknown> {
	// Your implementation here
	
	return NextResponse.json({ message: "Success" });
}

export async function POST(request:NextRequest,response:NextResponse):Promise<unknown> {
	// Your implementation here
	return NextResponse.json({ message: "Success" });
}