import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EvVehicle, ConnectorType, connectorTypes } from "@shared/schema";
import { Battery, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface VehicleSelectorProps {
  vehicle: EvVehicle;
  onChange: (vehicle: EvVehicle) => void;
}

export default function VehicleSelector({ vehicle, onChange }: VehicleSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-primary mr-2" />
          <span className="font-medium text-gray-800">{vehicle.name}</span>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="link" className="text-primary text-sm font-medium p-0 h-auto">
              Change
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change Vehicle</DialogTitle>
            </DialogHeader>
            <VehicleForm 
              vehicle={vehicle} 
              onSave={(updatedVehicle) => {
                onChange(updatedVehicle);
                setIsDialogOpen(false);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Connector Type:</span>
          <span className="font-medium">{vehicle.connectorTypes.join(", ")}</span>
        </div>
        <div className="flex justify-between">
          <span>Max Charging Rate:</span>
          <span className="font-medium">{vehicle.maxChargingRate} kW</span>
        </div>
        <div className="flex justify-between">
          <span>Battery Capacity:</span>
          <span className="font-medium">{vehicle.batteryCapacity} kWh</span>
        </div>
      </div>
    </div>
  );
}

interface VehicleFormProps {
  vehicle: EvVehicle;
  onSave: (vehicle: EvVehicle) => void;
}

function VehicleForm({ vehicle, onSave }: VehicleFormProps) {
  // Form setup
  const form = useForm({
    defaultValues: {
      ...vehicle
    }
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSave({
      ...data,
      // Ensure we have proper types for these numbers
      maxChargingRate: typeof data.maxChargingRate === 'string' 
        ? parseInt(data.maxChargingRate, 10) 
        : data.maxChargingRate,
      batteryCapacity: typeof data.batteryCapacity === 'string'
        ? parseInt(data.batteryCapacity, 10)
        : data.batteryCapacity,
      year: typeof data.year === 'string'
        ? parseInt(data.year, 10)
        : data.year
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="My EV" />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Tesla" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Model 3" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="2023" 
                  type="number" 
                  value={field.value?.toString() || ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="connectorTypes"
          render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel>Connector Types</FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {connectorTypes.map((type) => (
                  <FormField
                    key={type}
                    control={form.control}
                    name="connectorTypes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={type}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(type)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, type])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== type
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {type}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxChargingRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Charging Rate (kW)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="150" 
                    type="number" 
                    value={field.value?.toString() || ''}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="batteryCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Battery Capacity (kWh)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="75" 
                    type="number" 
                    value={field.value?.toString() || ''}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">Save Vehicle</Button>
      </form>
    </Form>
  );
}
