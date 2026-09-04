import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="glass border-t border-glass-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-rubik text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
              BinerCraft
            </h3>
            <p className="text-text-secondary text-sm">
              سرور ماینکرفت با گیم‌مودهای متنوع و جامعه بزرگ
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">لینک‌های سریع</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link to="/" className="hover:text-primary-600 transition-colors">خانه</Link></li>
              <li><Link to="/shop" className="hover:text-primary-600 transition-colors">فروشگاه</Link></li>
              <li><Link to="/blog" className="hover:text-primary-600 transition-colors">وبلاگ</Link></li>
              <li><Link to="/rules" className="hover:text-primary-600 transition-colors">قوانین</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">پشتیبانی</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link to="/guide" className="hover:text-primary-600 transition-colors">راهنما</Link></li>
              <li><Link to="/support" className="hover:text-primary-600 transition-colors">پشتیبانی</Link></li>
              <li><Link to="/faq" className="hover:text-primary-600 transition-colors">سوالات متداول</Link></li>
              <li><Link to="/contact" className="hover:text-primary-600 transition-colors">تماس با ما</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">شبکه‌های اجتماعی</h4>
            <div className="flex gap-4">
              <a href="#" className="text-2xl hover:text-primary-600 transition-colors">📺</a>
              <a href="#" className="text-2xl hover:text-primary-600 transition-colors">🐦</a>
              <a href="#" className="text-2xl hover:text-primary-600 transition-colors">📷</a>
              <a href="#" className="text-2xl hover:text-primary-600 transition-colors">🎮</a>
            </div>
          </div>
        </div>

        <div className="border-t border-glass-border mt-8 pt-6 text-center text-sm text-text-secondary">
          © {currentYear} BinerCraft.ir | تمامی حقوق محفوظ است
        </div>
      </div>
    </footer>
  )
}
