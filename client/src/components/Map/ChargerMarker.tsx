interface ChargerMarkerProps {
  status: "Available" | "Busy" | "Offline";
  isSelected?: boolean;
}

export default function ChargerMarker({ status, isSelected = false }: ChargerMarkerProps) {
  // Determine color based on status
  let bgColor = "bg-gray-500"; // Default color
  
  switch (status) {
    case "Available":
      bgColor = "bg-green-500"; // Green using Tailwind class
      break;
    case "Busy":
      bgColor = "bg-orange-500"; // Orange using Tailwind class
      break;
    case "Offline":
      bgColor = "bg-gray-500"; // Gray using Tailwind class
      break;
  }

  // Apply border if selected
  const border = isSelected ? "border-2 border-white" : "";
  
  // Apply shadow based on selection
  const shadow = isSelected ? "shadow-lg" : "shadow";

  // Simplified HTML content for the marker - using fewer inline styles
  const markerHtml = `
    <div class="${bgColor} text-white w-8 h-8 rounded-full ${border} ${shadow}" 
         style="display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 17h10v4H7z"></path>
        <path d="M17 7V3h-4"></path>
        <path d="M7 3h4v4"></path>
        <path d="M7 11h10"></path>
        <path d="M11 3v8"></path>
        <path d="M15.93 21a9 9 0 1 0-7.86 0"></path>
      </svg>
    </div>
  `;

  return <div dangerouslySetInnerHTML={{ __html: markerHtml }} />;
}
