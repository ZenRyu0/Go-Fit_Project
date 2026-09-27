import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  static String get baseUrl {
    final envUrl = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (envUrl.isNotEmpty) return envUrl;

    if (kIsWeb) {
      return 'https://go-fit-project.vercel.app';
    } else if (Platform.isAndroid) {
      return 'https://go-fit-project.vercel.app';
    } else {
      return 'https://go-fit-project.vercel.app';
    }
  }

  static const Duration timeout = Duration(seconds: 30);
}
