import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail } from 'lucide-react';

export default async function QuizInquiryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[#1e3a8a]/10 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-[#1e3a8a]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">퀴즈 문의</h1>
          <p className="text-gray-600">문제 오류나 개선 사항을 알려주세요</p>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>문의 방법</CardTitle>
            <CardDescription>
              문제 오류, 오타, 개선 제안 등을 보내주시면 검토 후 반영하겠습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">이메일 문의</p>
                <p className="text-sm text-gray-600">
                  devquiz@example.com
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>문의 시 포함해주세요:</strong>
              </p>
              <ul className="mt-2 text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>문제 카테고리 및 문제 번호</li>
                <li>문제 내용 또는 스크린샷</li>
                <li>오류 내용 또는 개선 제안</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">
              인앱 문의 기능은 준비 중입니다
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
