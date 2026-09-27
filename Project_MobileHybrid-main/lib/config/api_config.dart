class ApiConfig {
  static String get baseUrl {
    const envUrl = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (envUrl.isNotEmpty) return envUrl;

    return 'https://go-fit-project.vercel.app';
  }

  static const Duration timeout = Duration(seconds: 30);
}