import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer.jsx';
import './StaticPage.css';
import API_URL from '../config.js';

const DocsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);
  return (
    <div className="static-page">
      <header className="static-header">
        <Link to="/" className="back-link">
          <img src="/icons/orange.png" alt="OrangLib" className="header-logo" />
          <span>OrangLib</span>
        </Link>
      </header>
      <div className="content-with-sidebar">
        <div className={`docs-sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={closeSidebar} />
        <aside className={`docs-sidebar${sidebarOpen ? ' open' : ''}`}>
          <nav className="docs-nav" onClick={closeSidebar}>
            <h3>Developers</h3>
            <ul>
              <li><a href="#overview">Overview</a></li>
              <li><a href="#modpacks">Modpacks</a></li>
              <li><a href="#integration">Integration</a></li>
            </ul>
            <h3>ModPack Creators/Users</h3>
            <ul>
              <li><a href="#uploading">Uploading Modpack</a></li>
              <li><a href="#account">Account Things</a></li>
              <li><a href="#creating-modpack">How to create modpack</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
            <h3>Additional Info</h3>
            <ul>
              <li><a href="#contacts">Contacts</a></li>
              <li><a href="#legal">Legal Info</a></li>
            </ul>
          </nav>
        </aside>

        <main className="static-content docs-content">
          <h1>API Documentation</h1>
        <section className="doc-section" id="overview">
          <h2>Overview</h2>
          <p>The OrangLib API is a python API that allows you to interact with the modpack library. All responses are in JSON format.</p>
          <p><strong>Base URL:</strong> <code>{API_URL}</code></p>
          <p><strong>Content-Type:</strong> All POST/PUT requests should use <code>application/json</code> unless uploading files.</p>
        </section>
        <section className="doc-section" id="modpacks">
          <h2>Modpacks</h2>
          <h3>GET /modpacks</h3>
          <p>Get a paginated list of public modpacks (plus your own private modpacks if authenticated).</p>
          <div className="endpoint-details">
            <p><strong>Requires Auth:</strong> Optional</p>
          </div>
          <h4>Query Parameters:</h4>
          <table className="params-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>page</code></td>
                <td>integer</td>
                <td>1</td>
                <td>Page number</td>
              </tr>
              <tr>
                <td><code>page_size</code></td>
                <td>integer</td>
                <td>20</td>
                <td>Items per page (max: 100)</td>
              </tr>
              <tr>
                <td><code>search</code></td>
                <td>string</td>
                <td>-</td>
                <td>Search in name and description</td>
              </tr>
              <tr>
                <td><code>categories</code></td>
                <td>string</td>
                <td>-</td>
                <td>Comma-separated categories</td>
              </tr>
              <tr>
                <td><code>game_version</code></td>
                <td>string</td>
                <td>-</td>
                <td>Filter by Minecraft version</td>
              </tr>
              <tr>
                <td><code>sort_by</code></td>
                <td>string</td>
                <td>updated</td>
                <td>Sort by: updated, downloads, name</td>
              </tr>
            </tbody>
          </table>
          <h4>Response (200 OK):</h4>
          <pre><code>{`{
            "items": [...],
            "total": 100,
            "page": 1,
            "page_size": 20,
            "total_pages": 5
          }`}</code></pre>

          <h3>GET /modpacks/:id</h3>
          <p>Get detailed information about a modpack including all versions.</p>
          <div className="endpoint-details">
            <p><strong>Requires Auth:</strong> Optional (required for private modpacks)</p>
          </div>
          <h3>POST /modpacks</h3>
          <p>Create a new modpack.</p>
          <div className="endpoint-details">
            <p><strong>Requires Auth:</strong> Yes</p>
          </div>
          <h4>Request Body:</h4>
          <pre><code>{`{
            "name": "string",           // 2-100 chars
            "description": "string",    // Optional, max 5000 chars (Markdown)
            "is_public": true,          // Default: true
            "categories": ["Tech"],     // Optional, max 10 categories
            "game_version": "1.21.1"    // Minecraft version
          }`}</code></pre>
          <h3>PUT /modpacks/:id</h3>
          <p>Update a modpack (owner only).</p>
          <div className="endpoint-details">
            <p><strong>Requires Auth:</strong> Yes (owner)</p>
          </div>
          <h3>DELETE /modpacks/:id</h3>
          <p>Delete a modpack and all its versions (owner only).</p>
          <div className="endpoint-details">
            <p><strong>Requires Auth:</strong> Yes (owner)</p>
          </div>
          <h3>POST /modpacks/:id/icon</h3>
          <p>Upload a modpack icon image (owner only).</p>
          <div className="endpoint-details">
            <p><strong>Requires Auth:</strong> Yes (owner)</p>
            <p><strong>Content-Type:</strong> multipart/form-data</p>
            <p><strong>Max Size:</strong> 5 MB</p>
            <p><strong>Allowed Types:</strong> PNG, JPG, GIF, WebP</p>
          </div>
        </section>
        <section className="doc-section" id="integration">
          <h2>Integration to Launcher</h2>
          <p>Third-party launchers can integrate with the OrangLib API to provide modpack browsing and installation. Here are examples in popular programming languages:</p>
          <h2>OrangLauncher</h2>
          <p>OrangLauncher is the official launcher for OrangLib modpacks. It provides seamless integration with the API for browsing, downloading, and installing modpacks.</p>
          <h3>How OrangLauncher Works</h3>
          <p>The launcher uses the api like the scripts bellow:</p>
          <h3>Python Integration</h3>
          <pre><code>{`import requests
            import os

            class OrangLibClient:
                def __init__(self, base_url="https://api.oranges.lt"):
                    self.base_url = base_url
                    self.session = requests.Session()
                
                def get_modpacks(self, page=1, search=None, game_version=None):
                    params = {"page": page, "page_size": 20}
                    if search:
                        params["search"] = search
                    if game_version:
                        params["game_version"] = game_version
                    
                    response = self.session.get(f"{self.base_url}/modpacks", params=params)
                    response.raise_for_status()
                    return response.json()
                
                def get_modpack(self, modpack_id):
                    response = self.session.get(f"{self.base_url}/modpacks/{modpack_id}")
                    response.raise_for_status()
                    return response.json()
                
                def check_scan_status(self, modpack_id, version_id):
                    response = self.session.get(
                        f"{self.base_url}/modpacks/{modpack_id}/versions/{version_id}/scan"
                    )
                    response.raise_for_status()
                    return response.json()
                
                def download_modpack(self, modpack_id, version_id, save_path):
                    scan = self.check_scan_status(modpack_id, version_id)
                    if scan["verdict"] != "allow":
                        raise Exception(f"Cannot download: scan verdict is {scan['verdict']}")
                    
                    response = self.session.get(
                        f"{self.base_url}/modpacks/{modpack_id}/versions/{version_id}/download",
                        stream=True
                    )
                    response.raise_for_status()
                    
                    with open(save_path, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    return save_path

            client = OrangLibClient()
            modpacks = client.get_modpacks(search="tech", game_version="1.21.1")
            for pack in modpacks["items"]:
                print(f"{pack['name']} - {pack['download_count']} downloads")`}</code></pre>
          <h3>C# / .NET Integration</h3>
          <pre><code>{`using System.Net.Http;
            using System.Text.Json;

            public class OrangLibClient
            {
                private readonly HttpClient _client;
                private readonly string _baseUrl;

                public OrangLibClient(string baseUrl = "https://api.oranges.lt")
                {
                    _baseUrl = baseUrl;
                    _client = new HttpClient();
                }

                public async Task<ModpackList> GetModpacksAsync(int page = 1, string? search = null)
                {
                    var url = $"{_baseUrl}/modpacks?page={page}&page_size=20";
                    if (!string.IsNullOrEmpty(search))
                        url += $"&search={Uri.EscapeDataString(search)}";
                    
                    var response = await _client.GetStringAsync(url);
                    return JsonSerializer.Deserialize<ModpackList>(response);
                }

                public async Task<Modpack> GetModpackAsync(int modpackId)
                {
                    var response = await _client.GetStringAsync($"{_baseUrl}/modpacks/{modpackId}");
                    return JsonSerializer.Deserialize<Modpack>(response);
                }

                public async Task<ScanStatus> CheckScanStatusAsync(int modpackId, int versionId)
                {
                    var response = await _client.GetStringAsync(
                        $"{_baseUrl}/modpacks/{modpackId}/versions/{versionId}/scan");
                    return JsonSerializer.Deserialize<ScanStatus>(response);
                }

                public async Task DownloadModpackAsync(int modpackId, int versionId, string savePath)
                {
                    var scan = await CheckScanStatusAsync(modpackId, versionId);
                    if (scan.Verdict != "allow")
                        throw new Exception($"Cannot download: verdict is {scan.Verdict}");
                    
                    var stream = await _client.GetStreamAsync(
                        $"{_baseUrl}/modpacks/{modpackId}/versions/{versionId}/download");
                    
                    using var fileStream = File.Create(savePath);
                    await stream.CopyToAsync(fileStream);
                }
            }
            public record ModpackList(Modpack[] Items, int Total, int Page);
            public record Modpack(int Id, string Name, string Description, string GameVersion);
            public record ScanStatus(string Status, string Verdict, int Progress);`}</code></pre>

          <h3>Java Integration</h3>
          <pre><code>{`import java.net.http.*;
            import java.net.URI;
            import com.google.gson.Gson;

            public class OrangLibClient {
                private final HttpClient client;
                private final String baseUrl;
                private final Gson gson;
                public OrangLibClient() {
                    this("https://api.oranges.lt");
                }

                public OrangLibClient(String baseUrl) {
                    this.baseUrl = baseUrl;
                    this.client = HttpClient.newHttpClient();
                    this.gson = new Gson();
                }

                public ModpackList getModpacks(int page, String search) throws Exception {
                    String url = baseUrl + "/modpacks?page=" + page + "&page_size=20";
                    if (search != null && !search.isEmpty()) {
                        url += "&search=" + URLEncoder.encode(search, "UTF-8");
                    }
                    
                    HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .GET()
                        .build();
                    
                    HttpResponse<String> response = client.send(request, 
                        HttpResponse.BodyHandlers.ofString());
                    return gson.fromJson(response.body(), ModpackList.class);
                }

                public ScanStatus checkScanStatus(int modpackId, int versionId) throws Exception {
                    String url = String.format("%s/modpacks/%d/versions/%d/scan", 
                        baseUrl, modpackId, versionId);
                    
                    HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .GET()
                        .build();
                    
                    HttpResponse<String> response = client.send(request,
                        HttpResponse.BodyHandlers.ofString());
                    return gson.fromJson(response.body(), ScanStatus.class);
                }

                public void downloadModpack(int modpackId, int versionId, Path savePath) 
                        throws Exception {
                    ScanStatus scan = checkScanStatus(modpackId, versionId);
                    if (!"allow".equals(scan.verdict)) {
                        throw new RuntimeException("Cannot download: verdict is " + scan.verdict);
                    }
                    
                    String url = String.format("%s/modpacks/%d/versions/%d/download",
                        baseUrl, modpackId, versionId);
                    
                    HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .GET()
                        .build();
                    
                    client.send(request, HttpResponse.BodyHandlers.ofFile(savePath));
                }
            }

            class ModpackList {
                Modpack[] items;
                int total;
                int page;
            }

            class Modpack {
                int id;
                String name;
                String description;
                String gameVersion;
            }

            class ScanStatus {
                String status;
                String verdict;
                int progress;
            }`}</code></pre>

        </section>
        <section className="doc-section" id="uploading">
          <h2>Uploading Modpack</h2>
          <p>Follow these steps to upload your modpack to OrangLib:</p>

          <h3>Step 1: Prepare Your Modpack</h3>
          <ul>
            <li>Ensure your modpack is in a supported format: <code>.zip</code>, <code>.mrpack</code>, <code>.tar.gz</code>, or <code>.tar.lz</code></li>
            <li>Maximum file size: 500 MB</li>
          </ul>
          <h3>Step 2: Create the Modpack</h3>
          <ol>
            <li>Log in to your OrangLib account</li>
            <li>Click "Upload Modpack" in the navigation</li>
            <li>Fill in the modpack details:
              <ul>
                <li><strong>Name:</strong> 2-100 characters</li>
                <li><strong>Description:</strong> Supports Markdown formatting</li>
                <li><strong>Game Version:</strong> Select Minecraft version</li>
                <li><strong>Categories:</strong> Choose up to 10 categories</li>
                <li><strong>Visibility:</strong> Public or Private</li>
              </ul>
            </li>
          </ol>

          <h3>Step 3: Upload Version</h3>
          <ol>
            <li>Enter a version number (e.g., "1.0.0")</li>
            <li>Add changelog notes</li>
            <li>Select your modpack file</li>
            <li>Click Upload and wait for the virus scan to complete</li>
          </ol>

          <h3>Step 4: Add Icon (Optional)</h3>
          <p>Upload a modpack icon (PNG, JPG, or WebP) to make your modpack stand out.</p>
        </section>

        <section className="doc-section" id="account">
          <h2>Account Things</h2>

          <h3>Creating an Account</h3>
          <ul>
            <li>Username must be 3-30 characters, starting with a letter</li>
            <li>Email must be valid and unique</li>
            <li>Password requires: 8+ characters, uppercase, lowercase, and number</li>
          </ul>

          <h3>Logging In</h3>
          <p>Use your username and password to log in. A reCAPTCHA verification is required to prevent automated attacks.</p>

          <h3>Session Management</h3>
          <ul>
            <li>Access tokens expire after 24 hours</li>
            <li>You'll be automatically logged out when your token expires</li>
            <li>Log in again to get a new token</li>
          </ul>

          <h3>Account Security</h3>
          <ul>
            <li>Never share your access token</li>
            <li>Use a strong, unique password</li>
            <li>Log out when using shared computers</li>
          </ul>
        </section>

        <section className="doc-section" id="creating-modpack">
          <h2>How to Create a Modpack</h2>
          <p>A guide to creating your own Minecraft modpack for OrangLib.</p>
          
          <h3>Using Prism Launcher / MultiMC</h3>
          <ol>
            <li>Create a new Minecraft instance with your desired version</li>
            <li>Install a mod loader (Fabric, Forge, or Quilt)</li>
            <li>Right-click the instance → Export → Modrinth Pack (.mrpack)</li>
          </ol>

          <h3>Best Practices</h3>
          <ul>
            <li>Test your modpack thoroughly before uploading</li>
            <li>Write clear descriptions explaining what the pack offers</li>
            <li>Include changelogs for each version</li>
            <li>Use semantic versioning (1.0.0, 1.1.0, 2.0.0)</li>
            <li>Credit mod authors in your description</li>
            <li>Keep file sizes reasonable by using Modrinth downloads</li>
          </ul>
        </section>
        <section className="doc-section" id="security">
          <h2>Security</h2>
          <p>OrangLib takes security seriously to protect both users and modpack creators.</p>
          
          <h3>Virus Scanning</h3>
          <ul>
            <li>All uploads are scanned using ClamAV antivirus</li>
            <li>Custom YARA rules detect Minecraft-specific threats</li>
            <li>Files are checked against known malicious hashes</li>
            <li>Downloads are blocked until scan passes</li>
          </ul>

          <h3>Authentication Security</h3>
          <ul>
            <li>Passwords are hashed.</li>
            <li>JWT tokens for stateless authentication</li>
            <li>reCAPTCHA protects against automated attacks</li>
            <li>Rate limiting prevents brute force attempts</li>
          </ul>

          <h3>Data Protection</h3>
          <ul>
            <li>HTTPS/TLS encryption for all communications</li>
            <li>Sensitive data is never logged</li>
            <li>Tokens expire after 24 hours</li>
            <li>Generic error messages prevent information leakage</li>
          </ul>

          <h3>Reporting Security Issues</h3>
          <p>If you discover a security vulnerability, please email <code>software@oranges.lt</code> with details. Do not disclose publicly until we've had a chance to address it.</p>
        </section>

        <section className="doc-section" id="contacts">
          <h2>Contacts</h2>

          <h3>General Inquiries</h3>
          <p>For questions, suggestions, or feedback:</p>
          <ul>
            <li><strong>Email:</strong> <code>support@oranges.lt</code></li>
          </ul>

          <h3>Technical Support</h3>
          <p>For API issues, bug reports, or technical questions:</p>
          <ul>
            <li><strong>Email:</strong> <code>support@oranges.lt</code></li>
            <li><strong>GitHub:</strong> <code>Orang Studio</code></li>
          </ul>

          <h3>Security Reports</h3>
          <p>For security vulnerabilities or concerns:</p>
          <ul>
            <li><strong>Email:</strong> <code>security@oranges.lt</code></li>
          </ul>

          <div className="api-note">
            <strong>Note:</strong> The email address <code>notreply@oranges.lt</code> is used only for automated messages and cannot receive replies.
          </div>
        </section>
        <section className="doc-section" id="legal">
          <h2>Legal Info</h2>

          <h3>Terms of Service</h3>
          <p>By using OrangLib, you agree to:</p>
          <ul>
            <li>Not upload malicious content</li>
            <li>Respect intellectual property rights</li>
            <li>Not abuse the API or attempt to bypass rate limits</li>
            <li>Not impersonate others or create fake accounts</li>
          </ul>
          <p>Full terms available at <Link to="/terms">/terms</Link></p>

          <h3>Privacy Policy</h3>
          <p>We collect minimal data:</p>
          <ul>
            <li>Account information (username, email, hashed password)</li>
            <li>Uploaded modpacks and associated metadata</li>
            <li>Basic usage logs for security and debugging</li>
          </ul>
          <p>We do not sell your data to third parties. Full policy at <Link to="/privacy">/privacy</Link></p>
          <p>Cloudflare and Google could collect your data!</p>

          <h3>Content Policy</h3>
          <p>Uploaded modpacks must not contain:</p>
          <ul>
            <li>Malware, viruses, or malicious code</li>
            <li>Copyrighted content without permission</li>
            <li>Illegal or harmful material</li>
          </ul>

          <h3>DMCA</h3>
          <p>If you believe content infringes your copyright, contact <code>dmca@oranges.lt</code> with:</p>
          <ul>
            <li>Description of the copyrighted work</li>
            <li>URL of the infringing content</li>
            <li>Your contact information</li>
            <li>Statement of good faith belief</li>
          </ul>

          <h3>Open Source</h3>
          <p>OrangLib is free and open source software. The code is available under the MIT License.</p>
        </section>
      </main>
      </div>

      <button className="docs-sidebar-toggle" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle sidebar">
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <Footer />
    </div>
  );
};
export default DocsPage;