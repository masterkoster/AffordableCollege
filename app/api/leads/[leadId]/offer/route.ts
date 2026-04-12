import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params
  const user = await getAuthUser(request)
  
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { offerType, scholarshipAmount } = body

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        offerType,
        scholarshipAmount: offerType === 'TRANSFER_SCHOLARSHIP' ? scholarshipAmount : null,
        offerSentAt: new Date(),
        stage: 'OFFER_SENT',
      },
    })

    return NextResponse.json({ lead })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send offer' }, { status: 400 })
  }
}
