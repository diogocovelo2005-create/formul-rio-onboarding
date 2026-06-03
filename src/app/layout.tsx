import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onboarding — Configure o seu negócio",
  description:
    "Preencha o formulário para ativarmos o seu assistente virtual inteligente.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
