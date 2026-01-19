import { Card, CardBody, CardHeader, Image } from "@heroui/react";

export default function WeatherWidget() {
  return (
    <Card className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md border-none overflow-hidden">
      <CardBody className="p-4 flex flex-row justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
             <svg className="w-4 h-4 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
             <span className="text-small font-medium text-white/90">Pune Mandi</span>
          </div>
          <div className="flex items-baseline gap-2">
             <span className="text-4xl font-bold">28°</span>
             <span className="text-sm font-medium opacity-80">Sunny</span>
          </div>
          <p className="text-tiny opacity-70 mt-1">H:32° L:21° • Humidity: 45%</p>
        </div>
        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </div>
      </CardBody>
    </Card>
  );
}
