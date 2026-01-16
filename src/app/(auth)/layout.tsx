import { Source_Code_Pro } from "next/font/google";
import './../globals.css';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html>
            <body className={`${Source_Code_Pro} antialiased mobile-area border-l border-r`}>
                {children}
            </body>
        </html>
    );
}