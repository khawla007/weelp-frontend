import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
/**
 * DestinationListCard component displaying the DestinationListCard component
 * @param {{label:string, icon:string, items:number ,description:string, url:string}} props label,icons,items,description,url
 * @returns {JSX.Element}
 */
export const DestinationListCard = ({ label, icon, items, description, url }) => {
  const IconComponent = icon;
  return (
    <Card className="w-full md:max-w-[53rem] h-50 hover:bg-accent">
      <CardHeader className="flex-row justify-between">
        <div className="flex flex-row justify-between w-full">
          <div>
            <CardTitle className="text-sm">{label}</CardTitle>
            <Badge className="bg-accent text-black hover:text-white">{items} items</Badge>
          </div>
          <IconComponent size={18} />
        </div>
      </CardHeader>
      <CardContent>
        <p className=" text-gray-600 pb-4">{description}</p>
        <div className="flex items-center justify-between gap-3 ">
          <Link href={url} aschild="true" className="w-full">
            <Button className="w-full bg-accent text-black text-sm hover:text-white">
              <MapPin></MapPin>View
            </Button>
          </Link>
          <Button variant="outline">
            <Download />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
