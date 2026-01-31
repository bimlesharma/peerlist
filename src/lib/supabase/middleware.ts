import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired - required for Server Components
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected routes
    const protectedPaths = ['/dashboard', '/records', '/rankboard', '/settings'];
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath && !user) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users from landing/onboarding
    const pathname = request.nextUrl.pathname;
    const isLandingOrOnboarding = pathname === '/' || pathname === '/onboarding';
    if (isLandingOrOnboarding && user) {
        // Check if user has completed onboarding
        const { data: student, error } = await supabase
            .from('students')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

        const url = request.nextUrl.clone();

        if (student) {
            // User has profile, go to dashboard
            console.log('Middleware: Profile found for user', user.id, '- redirecting to dashboard');
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        } else if (pathname !== '/onboarding') {
            // User doesn't have profile, go to onboarding
            console.log('Middleware: No profile for user', user.id, '- redirecting to onboarding');
            url.pathname = '/onboarding';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
