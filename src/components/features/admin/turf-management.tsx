'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IndianRupee, Loader2, Plus, Trash2, Database } from 'lucide-react';
import { getTurfsFromFirestore, addTurf, deleteTurf, seedDefaultTurfs } from '@/lib/turf-service';
import type { Turf } from '@/lib/types';
import { turfs as defaultTurfs } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const AMENITY_OPTIONS = ['Parking', 'Floodlights', 'Washroom', 'Equipments'] as const;

const addTurfSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  location: z.string().min(1, 'Location is required.'),
  price: z.coerce.number().min(1, 'Price must be at least 1.'),
  imageId: z.string().min(1, 'Please select an image.'),
  amenities: z.array(z.enum(AMENITY_OPTIONS)).min(1, 'Select at least one amenity.'),
});

type AddTurfFormValues = z.infer<typeof addTurfSchema>;

export function TurfManagement() {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<AddTurfFormValues>({
    resolver: zodResolver(addTurfSchema),
    defaultValues: {
      name: '',
      location: '',
      price: 500,
      imageId: '',
      amenities: [],
    },
  });

  const fetchTurfs = async () => {
    setLoading(true);
    const data = await getTurfsFromFirestore();
    setTurfs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTurfs();
  }, []);

  async function onSubmit(data: AddTurfFormValues) {
    try {
      await addTurf(data);
      form.reset({
        name: '',
        location: '',
        price: 500,
        imageId: '',
        amenities: [],
      });
      await fetchTurfs();
      window.dispatchEvent(new CustomEvent('turfs-updated'));
      toast({ title: 'Turf Added', description: `${data.name} has been added successfully.` });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast({
        variant: 'destructive',
        title: 'Failed to add turf',
        description: `Ensure you're logged in as admin and the config/admins document exists in Firestore. ${msg}`,
      });
    }
  }

  const handleSeed = async () => {
    if (turfs.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Already populated',
        description: 'Turfs already exist. Seed only works when the list is empty.',
      });
      return;
    }
    try {
      await seedDefaultTurfs(defaultTurfs);
      await fetchTurfs();
      window.dispatchEvent(new CustomEvent('turfs-updated'));
      toast({ title: 'Turfs seeded', description: 'Default turfs have been added.' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast({
        variant: 'destructive',
        title: 'Failed to seed turfs',
        description: `Ensure config/admins exists in Firestore with your email. ${msg}`,
      });
    }
  };

  const handleDelete = async (turfId: string, turfName: string) => {
    if (!confirm(`Delete "${turfName}"? This cannot be undone.`)) return;
    try {
      await deleteTurf(turfId);
      await fetchTurfs();
      window.dispatchEvent(new CustomEvent('turfs-updated'));
      toast({ title: 'Turf Deleted', description: `${turfName} has been removed.` });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete turf.',
      });
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Add Turf</CardTitle>
          <CardDescription>Add a new turf to the booking system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Pavallion Sports Arena T4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="location">Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mira Bhayandar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="price">Base Price</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <IndianRupee className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input type="number" min={1} className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an image" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PlaceHolderImages.map((img) => (
                          <SelectItem key={img.id} value={img.id}>
                            {img.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <div className="flex flex-wrap gap-4 pt-2">
                      {AMENITY_OPTIONS.map((amenity) => (
                        <FormField
                          key={amenity}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  id={amenity}
                                  checked={field.value?.includes(amenity)}
                                  onCheckedChange={(checked) => {
                                    const next = checked
                                      ? [...(field.value || []), amenity]
                                      : (field.value || []).filter((a) => a !== amenity);
                                    field.onChange(next);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal" htmlFor={amenity}>{amenity}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Turf
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Current Turfs</CardTitle>
          <CardDescription>Manage turfs available for booking.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : turfs.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-muted-foreground text-center">No turfs yet. Add one using the form or seed defaults.</p>
              <Button variant="outline" onClick={handleSeed}>
                <Database className="mr-2 h-4 w-4" />
                Seed default turfs
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {turfs.map((turf) => (
                <li
                  key={turf.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{turf.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      {turf.location}
                      <span className="text-foreground font-medium flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {turf.price}
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(turf.id, turf.name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
