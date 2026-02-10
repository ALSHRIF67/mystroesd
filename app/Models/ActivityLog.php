<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';

    protected $fillable = [
        'type', 'subject_type', 'subject_id', 'causer_id', 'properties'
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    public static function log(string $type, $subject = null, $causer = null, array $properties = [])
    {
        $subjectType = null;
        $subjectId = null;

        if ($subject) {
            if (is_object($subject)) {
                $subjectType = get_class($subject);
                $subjectId = $subject->id ?? null;
            } else {
                $subjectType = (string) $subject;
            }
        }

        $causerId = null;
        if ($causer) {
            if (is_object($causer) && isset($causer->id)) {
                $causerId = $causer->id;
            } else {
                $causerId = $causer;
            }
        }
        // Also write a structured message to the application log for visibility
        \Log::info('ActivityLog: ' . $type, [
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'causer_id' => $causerId,
            'properties' => $properties,
        ]);

        return self::create([
            'type' => $type,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'causer_id' => $causerId,
            'properties' => $properties,
        ]);
    }
}
