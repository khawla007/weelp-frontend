import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Car, Clock, Globe, LucidePackage, Mail, MapPin, MoreHorizontal, Phone, Route, Settings, Tag, User, Users } from 'lucide-react';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { useParams, useRouter } from 'next/navigation';
import { stringSignRemover } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { editVendorStatusbyIdAdmin } from '@/lib/actions/vendor';
import { useToast } from '@/hooks/use-toast';

export const CardVendor = ({ id, title = '', description = '', status = '', vehicles = '', routes = '', mutate }) => {
  const router = useRouter(); // intialize route
  const { toast } = useToast(); //intialize toast

  // Handle Vendor Status
  const handleVendorStatus = async (vendorId, status) => {
    try {
      const res = await editVendorStatusbyIdAdmin(vendorId, { status }); // action for update status
      if (res.success) {
        toast({ title: res.message || 'Vendor updated successfully' });

        mutate();
      } else {
        toast({ title: res.message || 'Failed to update vendor' });
      }
    } catch (error) {
      toast({
        title: error?.response?.data?.message || 'Something Went Wrong ',
        variant: 'Destructive',
      }); // toast notfication
    }
  };

  return (
    <Card className="max-w-full md:max-w-md space-y-2">
      <CardHeader className="flex flex-row justify-between items-start p-4 md:p-6">
        <div className="space-y-2">
          <CardTitle className="first-letter:capitalize">{title}</CardTitle>

          {status === 'active' && (
            <Badge className="w-fit" variant="success">
              active
            </Badge>
          )}

          {status === 'inactive' && (
            <Badge className="w-fit" variant="destructive">
              inactive
            </Badge>
          )}

          {status === 'pending' && (
            <Badge className="w-fit bg-yellow-400" variant="ghost">
              pending
            </Badge>
          )}

          <CardDescription>{description}</CardDescription>
        </div>

        {/* DropDown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-auto" align="end" offset={10}>
            <DropdownMenuItem className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none" onClick={() => router.push(`/dashboard/admin/transfers/vendors/${id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none" onClick={() => router.push(`/dashboard/admin/transfers/vendors/${id}/routes`)}>
              Routes
            </DropdownMenuItem>
            <DropdownMenuItem className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none" onClick={() => router.push(`/dashboard/admin/transfers/vendors/${id}/pricing`)}>
              Pricing
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none"
              onClick={() => router.push(`/dashboard/admin/transfers/vendors/${id}/availability`)}
            >
              Availability
            </DropdownMenuItem>
            <DropdownMenuItem className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none" onClick={() => router.push(`/dashboard/admin/transfers/vendors/${id}/vehicles`)}>
              Vehicles
            </DropdownMenuItem>
            <DropdownMenuItem className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none" onClick={() => router.push(`/dashboard/admin/transfers/vendors/${id}/drivers`)}>
              Drivers
            </DropdownMenuItem>

            {/* Status Based Actions */}
            {status === 'active' && (
              <DropdownMenuItem className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none text-red-600" onClick={() => handleVendorStatus(id, 'inactive')}>
                Deactivate
              </DropdownMenuItem>
            )}

            {(status === 'inactive' || status === 'pending') && (
              <DropdownMenuItem className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none text-green-600" onClick={() => handleVendorStatus(id, 'active')}>
                Activate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <p className="text-sm font-normal">
          {vehicles && `Vehicle Types: ${vehicles}`} <br />
          {routes && `Service Areas: ${routes}`} <br />
          Suburbs Operating Hours: 06:00 - 22:00
        </p>
      </CardContent>

      <CardFooter className="grid md:grid-flow-col gap-2 p-4">
        <Button variant="outline" className="p-2" onClick={() => router.push(`/dashboard/admin/transfers/vendors/${id}/routes`)}>
          Routes
        </Button>
        <Button variant="outline" className="p-2" onClick={() => router.push(`/dashboard/admin/transfers/vendors/${id}/pricing`)}>
          Pricing
        </Button>
        <Button variant="outline" className="p-2" onClick={() => router.push(`/dashboard/admin/transfers/vendors/${id}/availability`)}>
          Availability
        </Button>
      </CardFooter>
    </Card>
  );
};

export const CardVendorRoute = ({ id, title = '', description = '', status = '', start_point = '', end_point = '', base_price = '', price_per_km = '' }) => {
  const router = useRouter(); // intialize route
  return (
    <Card className="max-w-full md:max-w-md space-y-2">
      <CardHeader className="flex flex-row justify-between items-start p-4 md:p-6 md:pb-4">
        <div className="space-y-4">
          <CardTitle className="first-letter:capitalize">{title}</CardTitle>
          <CardDescription className="text-sm first-letter:capitalize">{description}</CardDescription>
        </div>

        {status === 'Active' && (
          <Badge className="w-fit" variant="success">
            active
          </Badge>
        )}

        {status === 'Inactive' && (
          <Badge className="w-fit" variant="destructive">
            inactive
          </Badge>
        )}

        {status === 'Pending' && (
          <Badge className="w-fit bg-yellow-400" variant="ghost">
            pending
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-col pb-0">
        {start_point && (
          <span className="inline-flex text-sm items-center gap-2">
            <MapPin size={16} />
            From: {start_point}
          </span>
        )}

        {end_point && (
          <span className="inline-flex text-sm items-center gap-2">
            <MapPin size={16} />
            From: {end_point}
          </span>
        )}
      </CardContent>

      <CardFooter className="grid md:grid-flow-col gap-2  p-8 pt-0">
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span>Base Price:</span>
            <span className="font-medium">{base_price}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Price per KM:</span>
            <span className="font-medium">{price_per_km}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export const CardVendorPricing = ({
  vendor_id,
  name = '',
  description = '',
  status = '',
  base_price = '',
  price_per_km = '',
  min_distance = '',
  waiting_charge = '',
  peak_hour_multiplier = '',
  night_charge_multiplier = '',
}) => {
  return (
    <Card className="max-w-full md:max-w-md space-y-2">
      <CardHeader className="flex flex-row justify-between items-start p-4 md:p-6 md:pb-4">
        <div className="space-y-4">
          <CardTitle className="first-letter:capitalize">{name || 'Unnamed Tier'}</CardTitle>
          <CardDescription className="text-sm first-letter:capitalize">{description || 'No description provided'}</CardDescription>
        </div>

        {status === 'Active' && (
          <Badge className="w-fit" variant="success">
            active
          </Badge>
        )}

        {status === 'Inactive' && (
          <Badge className="w-fit" variant="destructive">
            inactive
          </Badge>
        )}

        {status === 'Pending' && (
          <Badge className="w-fit bg-yellow-400" variant="ghost">
            pending
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-col space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="font-light">Base Price:</span>
          <span className="font-medium">₹{base_price}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-light">Price per KM:</span>
          <span className="font-medium">₹{price_per_km}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-light">Minimum Distance:</span>
          <span className="font-medium">{min_distance} km</span>
        </div>

        <div className="flex justify-between">
          <span className="font-light">Waiting Charge:</span>
          <span className="font-medium">₹{waiting_charge}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-light">Night Charge Multiplier:</span>
          <span className="font-medium">×{night_charge_multiplier}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-light">Peak Hour Multiplier:</span>
          <span className="font-medium">×{peak_hour_multiplier}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const CardVendorVehicle = ({ id, vendor_id, make = '', status = '', model = '', year = '', vehicle_type = '', capacity = '', next_maintenance = '', license_plate = '', features = '' }) => {
  const router = useRouter();

  const allfeatures = ([] = features.split(','));
  return (
    <Card className="max-w-full md:max-w-md space-y-2">
      <CardHeader className="flex flex-row justify-between items-start p-4 md:p-6 md:pb-4">
        <div className="space-y-4">
          {/* Make */}
          <CardTitle className="first-letter:capitalize">{make}</CardTitle>

          <div className="flex space-x-2">
            {/* Status */}
            {status === 'available' && (
              <Badge className="w-fit" variant="success">
                Available
              </Badge>
            )}

            {status === 'in_use' && (
              <Badge className="w-fit" variant="destructive">
                In use
              </Badge>
            )}

            {status === 'maintenance' && (
              <Badge className="w-fit bg-yellow-400" variant="ghost">
                Maintenance
              </Badge>
            )}

            {/* Model */}
            {vehicle_type && (
              <Badge className="w-fit" variant="outline">
                {model}
              </Badge>
            )}
          </div>

          {/* license_plate */}
          {license_plate && <CardDescription className="text-sm first-letter:capitalize font-normal text-nowrap">License Plate: {license_plate}</CardDescription>}
        </div>

        {/* DropDown Menu */}
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto" align="end" offset={10}>
              <DropdownMenuItem
                className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none"
                onClick={() => router.push(`/dashboard/admin/transfers/vendors/${vendor_id}/vehicles/${id}/view`)}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none"
                onClick={() => router.push(`/dashboard/admin/transfers/vendors/${vendor_id}/vehicles/${id}/edit`)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none"
                onClick={() => router.push(`/dashboard/admin/transfers/vendors/${vendor_id}/pricing`)}
              >
                Schedules Maintenance
              </DropdownMenuItem>
              <DropdownMenuItem className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none text-red-600">Deactivate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col pb-2 space-y-2">
        {/* year */}
        {year && (
          <span className="inline-flex text-sm font-normal text-slate-800 items-center gap-2">
            <Car size={16} />
            Year: {year}
          </span>
        )}

        {/* capactiy */}
        {capacity && (
          <span className="inline-flex text-sm font-normal text-slate-800 items-center gap-2">
            <Users size={16} />
            Capacity: {`${capacity} Passengers`}
          </span>
        )}

        {/* maintenance */}
        {next_maintenance && (
          <span className="inline-flex text-sm font-normal text-slate-800 items-center gap-2">
            <Settings size={16} />
            Next Maintenance: {next_maintenance}
          </span>
        )}
      </CardContent>

      <CardFooter className="grid md:grid-flow-col gap-2  p-8 pt-0">
        {allfeatures.length > 0 && (
          <div className="grid">
            <span className=" grid-rows-1">Features:</span>
            <div>
              {allfeatures.map((feature, index) => {
                return (
                  <Badge key={index} variant="outline" className="mr-2 capitalize">
                    {stringSignRemover(feature)}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export const CardVendorAvailability = ({ id, date = '', end_time = '', start_time = '', max_bookings = '', price_multiplier = '', vehicle_id = '', vehicle_type = '' }) => {
  return (
    <Card className="max-w-full md:max-w-md space-y-2">
      <CardHeader className="flex flex-row justify-between items-start p-4 md:p-6 md:pb-4">
        <div className="space-y-4">
          {/* Vehicle Type */}
          <CardTitle className="uppercase">{vehicle_type}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col pb-2 space-y-2">
        {/* date */}
        {date && (
          <div className="flex items-center gap-2">
            <Calendar size={16} /> <span>{date}</span>
          </div>
        )}

        {/* start_time and end_time */}
        {start_time && end_time && (
          <div className="flex items-center gap-2">
            <Clock size={16} />{' '}
            <span>
              {start_time} - {end_time}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="grid md:grid-flow-row gap-2  p-8 pt-0">
        <Separator />

        {/* MaxBookings */}
        {max_bookings && (
          <div className="flex items-center justify-between gap-2 text-sm">
            Bookings: <span className="font-semibold">{max_bookings}</span>
          </div>
        )}

        {/* Price Multiplier */}
        {price_multiplier && (
          <div className="flex items-center justify-between gap-2 text-sm">
            Price Multiplier: <span className="font-semibold">{price_multiplier}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export const CardVendorDriver = ({
  id, // id is oreinted to context of using
  vendor_id = '',
  first_name = '',
  last_name = '',
  status = '',
  license_expiry = '',
  license_number = '',
  phone = '',
  languages = [],
  assigned_vehicle_id = '',
  assigned_vehicle_model = '',
}) => {
  const router = useRouter(); // initialize router
  return (
    <Card className="max-w-full md:max-w-md space-y-2">
      <CardHeader className="flex flex-row justify-between items-start p-4 md:p-6 md:pb-4">
        <div className="space-y-4">
          {/* Firtname & LastName */}
          <CardTitle className="first-letter:capitalize">{`${first_name}  ${last_name}`}</CardTitle>

          {/* Status [available ,off_duty, on_duty] */}
          <CardDescription>
            {status === 'available' && <Badge className="bg-yellow-400 text-black hover:bg-yellow-400">Available</Badge>}
            {status === 'off_duty' && <Badge variant="outline">Off Duty</Badge>}
            {status === 'on_duty' && <Badge variant="success">On Duty</Badge>}
          </CardDescription>
        </div>

        {/* DropDown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-auto" align="end" offset={10}>
            <DropdownMenuItem
              className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none"
              onClick={() => router.push(`/dashboard/admin/transfers/vendors/${vendor_id}/drivers/`)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none"
              onClick={() => router.push(`/dashboard/admin/transfers/vendors/${vendor_id}/drivers/edit`)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="px-2 py-1 text-sm hover:bg-[#f5f5f5] transition focus-visible:outline-none text-red-600">Deactivate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex flex-col space-y-2">
        <div className="text-sm text-[#71717A] mb-4 flex flex-col">
          {/* license_number */}
          {license_number && <span className="space-x-2">License: {license_number}</span>}

          {/* license_expiry */}
          {license_expiry && <span>Expires: {license_expiry}</span>}
        </div>

        <div>
          {/* phone */}
          {phone && (
            <div className="flex items-center text-sm gap-2 font-light">
              <Phone size={18} />
              {phone}
            </div>
          )}

          {/* model */}
          {assigned_vehicle_model && (
            <div className="flex items-center text-sm gap-2 font-light">
              <Car size={18} />
              {assigned_vehicle_model}
            </div>
          )}

          {/* languages */}
          <div className="flex flex-col gap-2  font-light capitalize">
            <span className="inline-flex items-center gap-2">
              <Globe size={18} /> Languages:
            </span>

            <div className=" space-x-2">
              {Array.isArray(languages) &&
                languages.length > 0 &&
                languages.map((language, index) => {
                  return (
                    <Badge key={index} variant="outline">
                      {language}
                    </Badge>
                  );
                })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CardVendorSchedule = ({ driver_name = '', shift = '', time = '', vehicle_make = '', vehicle_model = '' }) => {
  return (
    <Card>
      <CardContent className="flex justify-between p-4 ">
        <div className="flex items-center gap-4">
          <Users />

          <div>
            <CardTitle className="text-base">{driver_name}</CardTitle>
            <CardDescription>{shift}</CardDescription>
          </div>
        </div>
        <div className="flex items-center text-sm">
          <span className="flex items-center">
            <Car />
            {vehicle_make} {vehicle_model}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export const CardSingleContactInformation = ({
  id, // id is oreinted to context of using
  address = '',
  email = '',
}) => {
  const informationUiStructure = [
    { label: 'id', value: id, icon: <LucidePackage size={18} /> },
    { label: 'address', value: address, icon: <MapPin size={18} /> },
    { label: 'email', value: email, icon: <Mail size={18} /> },
  ];

  return (
    <Card className="w-full max-w-full space-y-2">
      <CardHeader>
        <CardTitle className="text-base">Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        {informationUiStructure.map(({ icon, value }, index) => {
          return (
            <div key={index} className="flex text-base items-center space-x-4 font-normal">
              {icon} : {value}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export const CardSingleServiceInformation = ({ routes = [], vehicles = [] }) => {
  const safeRoutes = Array.isArray(routes) ? routes : [];
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  return (
    <Card className="w-full max-w-full  space-y-2">
      <CardHeader>
        <CardTitle className="text-base">Service Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {/* Vehicle Types */}
        {safeVehicles.length > 0 && (
          <>
            <span className="text-sm font-semibold">Vehicle Types</span>
            <div className="space-x-2">
              {safeVehicles.map(({ vehicle_type }, index) => (
                <Badge key={index} variant="outline">
                  {vehicle_type}
                </Badge>
              ))}
            </div>
          </>
        )}

        {/* Services Areas */}
        {safeRoutes.length > 0 && (
          <>
            <span className="text-sm font-semibold">Service Areas</span>
            <div className="space-x-2">
              {safeRoutes.map(({ name }, index) => (
                <Badge key={index} variant="outline">
                  {name}
                </Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * It is Only Work Inside Single Vendor
 */
export const CardSingleRouteCard = () => {
  const params = useParams();
  const { vendorId } = useParams();
  const router = useRouter();

  // configuration route setup
  const routeConfig = [
    {
      icon: <Route size={18} />,
      title: 'Routes',
      path: `/dashboard/admin/transfers/vendors/${vendorId}/routes`,
      description: 'Manage transfer routes and pricing',
    },
    {
      icon: <Tag size={18} />,
      title: 'Pricing',
      path: `/dashboard/admin/transfers/vendors/${vendorId}/pricing`,
      description: 'Configure pricing tiers and rates',
    },
    {
      icon: <Calendar size={18} />,
      title: 'Availability',
      path: `/dashboard/admin/transfers/vendors/${vendorId}/availability`,
      description: 'Set time slots and vehicle availability',
    },
    {
      icon: <Car size={18} />,
      title: 'Vehicles',
      path: `/dashboard/admin/transfers/vendors/${vendorId}/vehicles`,
      description: 'Manage vehicle fleet',
    },
    {
      icon: <User size={18} />,
      title: 'Drivers',
      path: `/dashboard/admin/transfers/vendors/${vendorId}/drivers`,
      description: 'Manage driver profiles',
    },
    {
      icon: <Clock size={18} />,
      title: 'Schedule',
      path: `/dashboard/admin/transfers/vendors/${vendorId}/schedules`,
      description: 'View and manage bookings',
    },
  ];

  if (!vendorId) return;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 max-w-full w-full gap-4">
      {routeConfig.map(({ icon, title, path, description }, index) => {
        return (
          <Card key={index} className="w-full max-w-full  space-y-2 duration-300 ease-in-out hover:shadow-md hover:cursor-pointer">
            <CardHeader
              className="gap-6"
              onClick={() => {
                router.push(path);
              }}
            >
              <CardTitle className="text-lg">
                <span className="flex items-center gap-2">
                  {icon}
                  {title}
                </span>
              </CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
};
