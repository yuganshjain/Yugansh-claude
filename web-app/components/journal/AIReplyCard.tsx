export default function AIReplyCard({ reply }: { reply: string }) {
  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white text-sm">
          🌙
        </div>
        <div>
          <div className="text-sm font-semibold text-violet-800">Lumio</div>
          <div className="text-xs text-violet-500">Your wellness companion</div>
        </div>
      </div>
      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{reply}</p>
    </div>
  );
}
