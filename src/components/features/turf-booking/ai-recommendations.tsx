import type { BookingAssistantRecommendationsOutput } from '@/ai/flows/booking-assistant-recommendations';
import { Button } from '@/components/ui/button';
import { Bot, Clock, Sparkles } from 'lucide-react';

type AiRecommendationsProps = {
  recommendations: BookingAssistantRecommendationsOutput['recommendations'];
  onSelect: (startTime: string, endTime: string) => void;
};

export function AiRecommendations({ recommendations, onSelect }: AiRecommendationsProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="my-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h3 className="font-semibold text-primary">AI Booking Assistant</h3>
          <p className="text-sm text-muted-foreground">
            Your preferred slot is taken. Here are some alternatives:
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="rounded-md border bg-background p-3 transition-colors hover:bg-secondary/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-2 font-semibold">
                  <Clock className="h-4 w-4" />
                  <span>{`${formatTime(rec.startTime)} - ${formatTime(rec.endTime)}`}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                  <span>{rec.reason}</span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(rec.startTime, rec.endTime)}
              >
                Select
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
