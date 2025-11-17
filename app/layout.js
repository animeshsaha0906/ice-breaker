import localFont from "next/font/local";

export const metadata = { title: "Ice Breaker" };

const iceBreakerFont = localFont({
  src: "./assets/MuseoModerno-VariableFont_wght.ttf",
  variable: "--font-icebreaker"
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={iceBreakerFont.variable}>
        <div>{children}</div>
      </body>
    </html>
  );
}
