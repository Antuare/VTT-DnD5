defmodule MyVttWeb.Telemetry do
  use Supervisor
  import Telemetry.Metrics

  def start_link(arg) do
    Supervisor.start_link(__MODULE__, arg, name: __MODULE__)
  end

  @impl true
  def init(_arg) do
    children = [
      {:telemetry_poller, measurements: periodic_measurements(), period: 10_000}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  def metrics do
    [
      summary("vm.memory.total", unit: {:byte, :kilobyte}),
      summary("vm.total_run_queue_lengths.total"),
      summary("vm.total_run_queue_lengths.cpu"),
      summary("vm.total_run_queue_lengths.io"),
      summary("my_vtt.repo.query_total_time", unit: {:native, :millisecond}),
      summary("my_vtt.repo.query_decode_time", unit: {:native, :millisecond}),
      summary("phoenix.socket_connected", tags: [:transport]),
      summary("phoenix.channel_joined", tags: [:channel]),
      summary("phoenix.channel_handled_in", tags: [:event])
    ]
  end

  defp periodic_measurements do
    []
  end
end
