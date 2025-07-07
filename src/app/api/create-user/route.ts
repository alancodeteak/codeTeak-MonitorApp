export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import serviceAccount from '../../../../serviceAccountKey.json'; // Do NOT commit this file to git!

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export async function POST(req: NextRequest) {
  try {
    // Optionally, check if the requester is an employer (admin) here
    // For now, assume only employer can access this endpoint
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Add user to Firestore with role 'employee'
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      name,
      email,
      role: 'employee',
      status: 'Clocked Out',
      accumulatedTimeToday: 0,
      currentSessionStart: null,
      loggedTasks: [],
      assignedTasks: [],
      totalHours: 0,
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 