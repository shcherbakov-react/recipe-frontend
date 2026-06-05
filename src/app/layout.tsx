import {Metadata} from "next";

import './styles/reset.css';
import './styles/variables.css';
import s from './styles.module.css';

export const metadata: Metadata = {
  title: 'Рецептор',
  description: 'My App description.'
}

export default function RootLayout({
 children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div className={s.root} id="root">{children}</div>
      </body>
    </html>
  )
}