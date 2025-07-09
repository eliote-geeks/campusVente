<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Announcement;
use App\Models\Category;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard overview statistics
     */
    public function getOverview()
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalAnnouncements' => Announcement::count(),
            'totalCategories' => Category::where('is_active', true)->count(),
            'totalUniversities' => University::where('active', true)->count(),
            
            'activeUsers' => User::where('verified', true)->count(),
            'pendingAnnouncements' => Announcement::where('status', 'pending')->count(),
            'activeAnnouncements' => Announcement::where('status', 'active')->count(),
            'soldAnnouncements' => Announcement::where('status', 'sold')->count(),
            
            'todaySignups' => User::whereDate('created_at', today())->count(),
            'todayPosts' => Announcement::whereDate('created_at', today())->count(),
            'thisWeekSignups' => User::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'thisWeekPosts' => Announcement::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            
            'studentsCount' => User::where('is_student', true)->count(),
            'professionalsCount' => User::where('is_student', false)->count(),
            'onlineUsers' => User::where('last_seen', '>=', now()->subMinutes(5))->count(),
            'urgentAnnouncements' => Announcement::where('is_urgent', true)->where('status', 'active')->count()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get recent activity for dashboard
     */
    public function getRecentActivity()
    {
        $activities = collect();

        // Recent user registrations
        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => 'user_' . $user->id,
                    'type' => 'user',
                    'action' => 'Nouvel utilisateur inscrit',
                    'user' => $user->name,
                    'details' => $user->university ?? 'Université non spécifiée',
                    'time' => $user->created_at->diffForHumans(),
                    'status' => $user->verified ? 'success' : 'warning',
                    'created_at' => $user->created_at
                ];
            });

        // Recent announcements
        $recentAnnouncements = Announcement::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => 'announcement_' . $announcement->id,
                    'type' => 'announcement',
                    'action' => 'Nouvelle annonce publiée',
                    'user' => $announcement->user->name ?? 'Utilisateur inconnu',
                    'details' => $announcement->title,
                    'time' => $announcement->created_at->diffForHumans(),
                    'status' => $announcement->status === 'active' ? 'success' : 
                               ($announcement->status === 'pending' ? 'warning' : 'info'),
                    'created_at' => $announcement->created_at
                ];
            });

        // Recent categories
        $recentCategories = Category::orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($category) {
                return [
                    'id' => 'category_' . $category->id,
                    'type' => 'category',
                    'action' => 'Nouvelle catégorie créée',
                    'user' => 'Admin',
                    'details' => $category->icon . ' ' . $category->name,
                    'time' => $category->created_at->diffForHumans(),
                    'status' => $category->is_active ? 'success' : 'secondary',
                    'created_at' => $category->created_at
                ];
            });

        // Merge and sort activities
        $activities = $recentUsers
            ->concat($recentAnnouncements)
            ->concat($recentCategories)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }

    /**
     * Get announcements statistics by category
     */
    public function getAnnouncementsByCategory()
    {
        $stats = Category::withCount(['announcements' => function ($query) {
                $query->where('status', 'active');
            }])
            ->where('is_active', true)
            ->orderBy('announcements_count', 'desc')
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'icon' => $category->icon,
                    'count' => $category->announcements_count,
                    'percentage' => 0 // Will be calculated below
                ];
            });

        $total = $stats->sum('count');
        if ($total > 0) {
            $stats = $stats->map(function ($item) use ($total) {
                $item['percentage'] = round(($item['count'] / $total) * 100, 1);
                return $item;
            });
        }

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get announcements statistics by type
     */
    public function getAnnouncementsByType()
    {
        $stats = Announcement::select('type', DB::raw('count(*) as count'))
            ->where('status', 'active')
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                $typeLabels = [
                    'sell' => 'Vente',
                    'buy' => 'Achat',
                    'service' => 'Service',
                    'exchange' => 'Échange'
                ];
                
                $typeIcons = [
                    'sell' => '🛒',
                    'buy' => '🔍',
                    'service' => '🛠️',
                    'exchange' => '🔄'
                ];

                return [
                    'type' => $item->type,
                    'label' => $typeLabels[$item->type] ?? $item->type,
                    'icon' => $typeIcons[$item->type] ?? '📝',
                    'count' => $item->count,
                    'percentage' => 0 // Will be calculated below
                ];
            });

        $total = $stats->sum('count');
        if ($total > 0) {
            $stats = $stats->map(function ($item) use ($total) {
                $item['percentage'] = round(($item['count'] / $total) * 100, 1);
                return $item;
            });
        }

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get monthly growth statistics
     */
    public function getMonthlyGrowth()
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months[] = [
                'month' => $date->format('M Y'),
                'users' => User::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
                'announcements' => Announcement::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count()
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $months
        ]);
    }

    /**
     * Get top universities by user count
     */
    public function getTopUniversities()
    {
        $universities = User::select('university', DB::raw('count(*) as user_count'))
            ->whereNotNull('university')
            ->where('university', '!=', '')
            ->groupBy('university')
            ->orderBy('user_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->university,
                    'user_count' => $item->user_count,
                    'percentage' => 0 // Will be calculated below
                ];
            });

        $total = $universities->sum('user_count');
        if ($total > 0) {
            $universities = $universities->map(function ($item) use ($total) {
                $item['percentage'] = round(($item['user_count'] / $total) * 100, 1);
                return $item;
            });
        }

        return response()->json([
            'success' => true,
            'data' => $universities
        ]);
    }
}