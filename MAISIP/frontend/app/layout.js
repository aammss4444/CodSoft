import "./globals.css";

export const metadata = {
  title: "Athlete Digital Identity | Maharashtra Sports Department",
  description: "Create a Unique Digital Identity for Every Athlete",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
