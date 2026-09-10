<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HazardReport extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'barangay',
        'hazard_type',
        'description',
        'latitude',
        'longitude',
        'location_name',
        'ai_hazard_type',
        'ai_severity',
        'ai_confidence',
        'severity',
        'severity_overridden',
        'severity_override_reason',
        'severity_overridden_by',
        'status',
        'verified_by',
        'verified_at',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'ai_confidence' => 'decimal:4',
            'severity_overridden' => 'boolean',
            'verified_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ReportImage::class, 'report_id');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ReportStatusHistory::class, 'report_id');
    }
}