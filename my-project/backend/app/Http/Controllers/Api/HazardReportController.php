<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HazardReport;
use App\Models\ReportImage;
use App\Models\ReportStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class HazardReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reports = HazardReport::query()
            ->with([
                'user',
                'images' => fn ($query) => $query->orderByDesc('uploaded_at'),
                'statusHistory' => fn ($query) => $query->orderBy('created_at'),
            ])
            ->latest()
            ->get()
            ->map(fn (HazardReport $report) => $this->presentReport($report));

        return response()->json([
            'reports' => $reports,
        ]);
    }

    public function mine(Request $request): JsonResponse
    {
        $reports = $request->user()
            ->reports()
            ->with([
                'user',
                'images' => fn ($query) => $query->orderByDesc('uploaded_at'),
                'statusHistory' => fn ($query) => $query->orderBy('created_at'),
            ])
            ->latest()
            ->get()
            ->map(fn (HazardReport $report) => $this->presentReport($report));

        return response()->json([
            'reports' => $reports,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'hazard_type' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'location_name' => ['required', 'string', 'max:255'],
            'barangay' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'image_data' => ['nullable', 'string'],
            'image_name' => ['nullable', 'string', 'max:255'],
            'image_mime' => ['nullable', 'string', 'max:100'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (! $request->hasFile('image') && ! $request->filled('image_data')) {
            return response()->json([
                'message' => 'An image is required.',
            ], 422);
        }

        $report = HazardReport::create([
            'user_id' => $request->user()->id,
            'title' => $request->string('title')->toString(),
            'barangay' => $request->string('barangay')->toString(),
            'hazard_type' => $request->string('hazard_type')->toString(),
            'description' => $request->input('description'),
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
            'location_name' => $request->string('location_name')->toString(),
            'status' => 'pending',
        ]);

        ReportStatusHistory::create([
            'report_id' => $report->id,
            'changed_by' => $request->user()->id,
            'old_status' => null,
            'new_status' => 'Submitted',
            'remarks' => 'Report created by the reporter.',
            'created_at' => now(),
        ]);

        ReportStatusHistory::create([
            'report_id' => $report->id,
            'changed_by' => $request->user()->id,
            'old_status' => 'Submitted',
            'new_status' => 'Pending',
            'remarks' => 'Awaiting verification.',
            'created_at' => now(),
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('report-images', 'public');
            $imageUrl = Storage::disk('public')->url($imagePath);
        } else {
            $imageData = (string) $request->input('image_data');
            $imageName = $request->input('image_name') ?: 'report-image.jpg';
            $imageMime = $request->input('image_mime') ?: 'image/jpeg';

            if (Str::contains($imageData, ',')) {
                $imageData = Str::after($imageData, ',');
            }

            $binaryImage = base64_decode($imageData, true);

            if ($binaryImage === false) {
                return response()->json([
                    'message' => 'The provided image data is invalid.',
                ], 422);
            }

            $imageExtension = match ($imageMime) {
                'image/png' => 'png',
                'image/webp' => 'webp',
                default => 'jpg',
            };

            $imagePath = 'report-images/'.now()->format('YmdHis').'-'.Str::uuid().'.'.$imageExtension;
            Storage::disk('public')->put($imagePath, $binaryImage);
            $imageUrl = Storage::disk('public')->url($imagePath);
        }

        $image = ReportImage::create([
            'report_id' => $report->id,
            'image_url' => $imageUrl,
            'uploaded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Report submitted successfully.',
            'report' => $this->presentReport($report->load(['user', 'images', 'statusHistory'])),
        ], 201);
    }

    private function presentReport(HazardReport $report): array
    {
        $createdAt = $report->created_at ?? now();
        $statusHistory = $report->statusHistory
            ->sortBy('created_at')
            ->map(function (ReportStatusHistory $statusHistory) {
                return [
                    'status' => $statusHistory->new_status,
                    'timestamp' => $statusHistory->created_at?->format('m/d/Y h:ia'),
                    'remarks' => $statusHistory->remarks,
                ];
            })
            ->values()
            ->all();

        $imageUrl = $report->images->first()?->image_url;
        $barangayNumber = preg_match('/\d+/', (string) $report->barangay, $matches) ? (int) $matches[0] : null;

        return [
            'id' => $report->id,
            'reporterId' => $report->user_id,
            'reporterName' => $report->user?->name ?? 'NorthSafe User',
            'timeAgo' => $createdAt->diffForHumans(),
            'alertLevel' => $this->deriveAlertLevel($report),
            'title' => $report->title,
            'description' => $report->description,
            'address' => $report->location_name,
            'dateTime' => $createdAt->format('m/d/Y h:ia'),
            'hazardType' => $report->hazard_type,
            'barangay' => $barangayNumber,
            'lat' => (float) $report->latitude,
            'lng' => (float) $report->longitude,
            'statusHistory' => $statusHistory,
            'upvotes' => 0,
            'downvotes' => 0,
            'comments' => 0,
            'imageSrc' => $imageUrl,
            'status' => ucfirst($report->status),
            'createdAt' => $report->created_at?->toISOString(),
        ];
    }

    private function deriveAlertLevel(HazardReport $report): string
    {
        return match (strtolower((string) $report->status)) {
            'resolved' => 'red',
            'rejected' => 'white',
            default => 'blue',
        };
    }
}