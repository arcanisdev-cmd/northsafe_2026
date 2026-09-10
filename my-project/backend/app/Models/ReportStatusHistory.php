<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportStatusHistory extends Model
{
    public $timestamps = false;

    protected $table = 'report_status_history';

    protected $fillable = [
        'report_id',
        'changed_by',
        'old_status',
        'new_status',
        'remarks',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(HazardReport::class, 'report_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}