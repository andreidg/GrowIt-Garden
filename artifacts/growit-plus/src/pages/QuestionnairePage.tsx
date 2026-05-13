import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FROST_DATA } from "@/data/locations";
import { GardenSetup } from "@/data/plan-generator";
import { ChevronLeft } from "lucide-react";

const formSchema = z.object({
  region: z.string().min(1, "Please select a region"),
  lengthFt: z.coerce.number().min(1).max(20),
  widthFt: z.coerce.number().min(1).max(20),
  sunlight: z.enum(["Full Sun", "Partial Shade", "Full Shade"]),
  soilType: z.enum(["Raised Bed", "In-Ground Clay", "In-Ground Loam", "Container/Pots"]),
  plantPreference: z.enum(["Vegetables Only", "Vegetables + Herbs"]),
});

type FormValues = z.infer<typeof formSchema>;

interface QuestionnairePageProps {
  onNext: (data: GardenSetup) => void;
  onBack: () => void;
}

export default function QuestionnairePage({ onNext, onBack }: QuestionnairePageProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "Calgary",
      lengthFt: 4,
      widthFt: 8,
      sunlight: "Full Sun",
      soilType: "Raised Bed",
      plantPreference: "Vegetables + Herbs",
    },
  });

  const onSubmit = (values: FormValues) => {
    onNext(values);
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) return field.onChange("");
    if (val > 20) {
      val = 20;
    }
    field.onChange(val);
  };

  const lengthValue = form.watch("lengthFt");
  const widthValue = form.watch("widthFt");
  const showDimensionWarning = lengthValue === 20 || widthValue === 20;

  return (
    <div className="w-full max-w-2xl mx-auto animate-in slide-in-from-right-8 duration-300">
      <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground" onClick={onBack} data-testid="btn-back">
        <ChevronLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Tell us about your space</h2>
        <p className="text-muted-foreground">We need a few details to generate your perfect garden plan.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-card p-6 md:p-8 rounded-xl border shadow-sm">
          
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Where are you planting?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(FROST_DATA).map(region => (
                      <SelectItem key={region} value={region} data-testid={`region-${region}`}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="lengthFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Length (feet)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      {...field} 
                      onChange={(e) => handleDimensionChange(e, field)}
                      data-testid="input-length"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="widthFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Width (feet)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      {...field} 
                      onChange={(e) => handleDimensionChange(e, field)}
                      data-testid="input-width"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {showDimensionWarning && (
            <p className="text-sm text-secondary font-medium mt-1 bg-secondary/10 p-2 rounded">
              GrowIt+ supports gardens up to 20ft × 20ft. Dimensions &gt;20ft are capped.
            </p>
          )}

          <FormField
            control={form.control}
            name="sunlight"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg font-semibold">Sunlight Exposure</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                    data-testid="radio-sunlight"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Full Sun" />
                      </FormControl>
                      <FormLabel className="font-normal">Full Sun (6+ hours)</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Partial Shade" />
                      </FormControl>
                      <FormLabel className="font-normal">Partial Shade (3-6 hours)</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Full Shade" />
                      </FormControl>
                      <FormLabel className="font-normal">Full Shade (&lt;3 hours)</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="soilType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg font-semibold">Soil Setup</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    data-testid="radio-soil"
                  >
                    {["Raised Bed", "In-Ground Clay", "In-Ground Loam", "Container/Pots"].map((soil) => (
                      <FormItem key={soil} className="flex items-center space-x-3 space-y-0 border p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                        <FormControl>
                          <RadioGroupItem value={soil} />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer w-full">{soil}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="plantPreference"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg font-semibold">What do you want to grow?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                    data-testid="radio-preference"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Vegetables + Herbs" />
                      </FormControl>
                      <FormLabel className="font-normal">Vegetables + Herbs (Recommended)</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Vegetables Only" />
                      </FormControl>
                      <FormLabel className="font-normal">Vegetables Only</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button type="submit" size="lg" className="w-full text-lg h-14" data-testid="btn-next-questionnaire">
              Review Frost Dates
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
