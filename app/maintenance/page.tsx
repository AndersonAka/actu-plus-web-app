export const dynamic = 'force-dynamic';

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <MaintenanceIllustration className="mx-auto mb-8 h-56 w-56" />

        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-lg font-bold text-white">
          A+
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
          Site en maintenance
        </h1>
        <p className="mx-auto max-w-md text-gray-600">
          Nous améliorons actuellement Actu Plus pour vous offrir une meilleure expérience.
          Le site sera de retour très bientôt. Merci de votre patience.
        </p>
      </div>
    </div>
  );
}

function MaintenanceIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="120" cy="120" r="110" fill="#FEE2E2" />
      <circle cx="120" cy="120" r="80" fill="#FECACA" />

      {/* Grand engrenage */}
      <g transform="translate(95 90)">
        <path
          d="M40 0c2.5 0 4.9.2 7.3.6l3 13.4c3.9 1.1 7.6 2.7 10.9 4.8l11.7-6.9c3.8 3.2 7.1 6.9 9.8 11l-8.4 10.9c1.7 3.6 2.9 7.4 3.6 11.4l13.4 3.5c.3 2.4.5 4.9.5 7.4s-.2 5-.5 7.4l-13.4 3.5c-.7 4-1.9 7.8-3.6 11.4l8.4 10.9c-2.7 4.1-6 7.8-9.8 11l-11.7-6.9c-3.3 2.1-7 3.7-10.9 4.8l-3 13.4c-2.4.4-4.8.6-7.3.6s-4.9-.2-7.3-.6l-3-13.4c-3.9-1.1-7.6-2.7-10.9-4.8L7.1 116.6c-3.8-3.2-7.1-6.9-9.8-11l8.4-10.9c-1.7-3.6-2.9-7.4-3.6-11.4L-11.3 79.8c-.3-2.4-.5-4.9-.5-7.4s.2-5 .5-7.4l13.4-3.5c.7-4 1.9-7.8 3.6-11.4l-8.4-10.9c2.7-4.1 6-7.8 9.8-11l11.7 6.9c3.3-2.1 7-3.7 10.9-4.8l3-13.4C35.1.2 37.5 0 40 0z"
          fill="#DC2626"
          transform="translate(0 -20)"
        />
        <circle cx="40" cy="52" r="20" fill="#FEE2E2" />
      </g>

      {/* Petit engrenage */}
      <g transform="translate(140 140)">
        <path
          d="M28 0c1.8 0 3.4.1 5.1.4l2.1 9.4c2.7.8 5.3 1.9 7.6 3.4l8.2-4.8c2.6 2.2 5 4.8 6.9 7.7l-5.9 7.6c1.2 2.5 2 5.2 2.5 8l9.4 2.4c.2 1.7.3 3.4.3 5.1s-.1 3.4-.3 5.1l-9.4 2.4c-.5 2.8-1.3 5.5-2.5 8l5.9 7.6c-1.9 2.9-4.3 5.5-6.9 7.7l-8.2-4.8c-2.3 1.5-4.9 2.6-7.6 3.4l-2.1 9.4c-1.7.2-3.3.4-5.1.4s-3.4-.1-5.1-.4l-2.1-9.4c-2.7-.8-5.3-1.9-7.6-3.4l-8.2 4.8c-2.6-2.2-5-4.8-6.9-7.7l5.9-7.6c-1.2-2.5-2-5.2-2.5-8l-9.4-2.4c-.2-1.7-.3-3.4-.3-5.1s.1-3.4.3-5.1l9.4-2.4c.5-2.8 1.3-5.5 2.5-8l-5.9-7.6c1.9-2.9 4.3-5.5 6.9-7.7l8.2 4.8c2.3-1.5 4.9-2.6 7.6-3.4L22.9.4C24.6.1 26.2 0 28 0z"
          fill="#B91C1C"
          transform="translate(0 -14)"
        />
        <circle cx="28" cy="36.5" r="14" fill="#FEE2E2" />
      </g>

      {/* Clé à molette */}
      <g transform="translate(70 150) rotate(-25)">
        <rect x="0" y="0" width="14" height="60" rx="6" fill="#7F1D1D" />
        <circle cx="7" cy="0" r="16" fill="none" stroke="#7F1D1D" strokeWidth="8" />
      </g>
    </svg>
  );
}
