import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-surface dark:bg-surface-container-lowest transition-colors duration-500 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-3xl w-full text-center space-y-12">
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-serif text-3xl shadow-xl shadow-primary/10">
              S
            </div>
            <h1 className="text-4xl font-serif text-on-surface tracking-tight">ScribeSoul</h1>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-serif text-on-surface leading-[1.1] tracking-tight text-balance">
            Nơi ngôn từ tìm thấy <span className="italic text-primary">linh hồn</span> của mình.
          </h2>
          
          <p className="font-sans text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed text-balance">
            Nền tảng viết lách tích hợp AI giúp bạn vượt qua nỗi sợ trang giấy trắng và kiến tạo những thế giới phi thường.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
          <Link href="/workspace/default" className="w-full sm:w-auto h-14 px-8 flex items-center justify-center space-x-3 rounded-full bg-primary text-primary-foreground hover:bg-on-surface transition-all shadow-xl shadow-primary/20 group">
            <span className="font-sans font-semibold tracking-wide">Vào thư viện của bạn</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link href="/login" className="w-full sm:w-auto h-14 px-8 flex items-center justify-center space-x-3 rounded-full bg-surface-container-low dark:bg-surface-container-high border border-border/10 hover:bg-surface-container-high transition-all group">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="font-sans font-medium text-on-surface">Khám phá Soul Assistant</span>
          </Link>
        </div>

        <div className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="space-y-3">
            <h3 className="font-serif text-xl text-on-surface">Silent Manuscript</h3>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              Giao diện tối giản, loại bỏ mọi xao nhãng để bạn tập trung hoàn toàn vào dòng chảy sáng tạo.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-serif text-xl text-on-surface">Deep Space AI</h3>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              Trợ lý AI thấu hiểu bối cảnh, nhân vật và cốt truyện của bạn như một người bạn đồng hành.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-serif text-xl text-on-surface">Mạng lưới kiến thức</h3>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              Tự động kết nối và trực quan hóa các thực thể trong câu chuyện qua bộ não Vector thông minh.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
